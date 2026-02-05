import {
  mutateStore,
  audit,
  type Session,
  type Order,
  type OrderItem,
  type Station,
  type ItemStatus,
  type OrderStatus,
} from "./persist.store";
import { publish } from "./realtime.bus";

const SESSION_IDLE_MS = 1000 * 60 * 90; // 90 minutes idle expiry

function now() { return Date.now(); }

function resolveTableNumber(tagId: string): string | null {
  return mutateStore((s) => {
    const a = s.tableAssignments[tagId];
    return a?.confirmed ? a.tableNumber : null;
  });
}

export function openOrResumeSession(tagId: string): Session {
  return mutateStore((s) => {
    // expire old sessions
    for (const id of Object.keys(s.sessions)) {
      const sess = s.sessions[id];
      if (sess.status === "OPEN" && now() > sess.expiresAt) {
        sess.status = "CLOSED";
        sess.closedAt = now();
        sess.updatedAt = now();
        audit("system", "session.expired", { sessionId: sess.id, tagId: sess.tagId });
      }
    }

    let session = Object.values(s.sessions).find(
      (x) => x.tagId === tagId && x.status === "OPEN"
    );

    if (!session) {
      session = {
        id: crypto.randomUUID(),
        tagId,
        tableNumber: resolveTableNumber(tagId),
        status: "OPEN",
        openedAt: now(),
        updatedAt: now(),
        closedAt: null,
        expiresAt: now() + SESSION_IDLE_MS,
      };
      s.sessions[session.id] = session;
      audit("system", "session.opened", { sessionId: session.id, tagId });
      publish({ type: "session.opened", sessionId: session.id, tagId });
    } else {
      session.updatedAt = now();
      session.expiresAt = now() + SESSION_IDLE_MS;
      session.tableNumber = resolveTableNumber(tagId);
      audit("system", "session.touched", { sessionId: session.id, tagId });
    }

    return session;
  });
}

export function closeSessionByTag(tagId: string) {
  return mutateStore((s) => {
    const session = Object.values(s.sessions).find(
      (x) => x.tagId === tagId && x.status === "OPEN"
    );
    if (!session) return null;

    session.status = "CLOSED";
    session.closedAt = now();
    session.updatedAt = now();
    audit("staff", "session.closed", { sessionId: session.id, tagId });
    publish({ type: "session.closed", sessionId: session.id, tagId });
    return session;
  });
}

export function listOpenSessions() {
  return mutateStore((s) => {
    // auto-expire sweep
    for (const id of Object.keys(s.sessions)) {
      const sess = s.sessions[id];
      if (sess.status === "OPEN" && now() > sess.expiresAt) {
        sess.status = "CLOSED";
        sess.closedAt = now();
        sess.updatedAt = now();
        audit("system", "session.expired", { sessionId: sess.id, tagId: sess.tagId });
      }
    }
    return Object.values(s.sessions).filter(x => x.status === "OPEN");
  });
}

export function setTableAssignment(tagId: string, tableNumber: string, confirmed: boolean) {
  return mutateStore((s) => {
    s.tableAssignments[tagId] = {
      tagId,
      tableNumber,
      confirmed,
      updatedAt: now(),
    };
    // update open session (if any)
    const session = Object.values(s.sessions).find(
      (x) => x.tagId === tagId && x.status === "OPEN"
    );
    if (session) {
      session.tableNumber = confirmed ? tableNumber : session.tableNumber;
      session.updatedAt = now();
      session.expiresAt = now() + SESSION_IDLE_MS;
    }
    audit("staff", "table.assignment", { tagId, tableNumber, confirmed });
    publish({ type: "table.assignment", tagId, tableNumber, confirmed });
    return s.tableAssignments[tagId];
  });
}

function normalizeStation(station: any): Station {
  return station === "BAR" ? "BAR" : "KITCHEN";
}

function itemReadyStatus(items: OrderItem[]) {
  const active = items.filter(i => i.status !== "CANCELLED");
  if (active.length === 0) return { allReady: false, allDelivered: false };
  const allReady = active.every(i => i.status === "READY" || i.status === "DELIVERED");
  const allDelivered = active.every(i => i.status === "DELIVERED");
  return { allReady, allDelivered };
}

export function submitOrder(input: {
  tagId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    station: Station;
  }>;
  notes?: string;
}) : Order {
  const session = openOrResumeSession(input.tagId);

  return mutateStore((s) => {
    // guard: cannot add to closed session
    const sess = s.sessions[session.id];
    if (!sess || sess.status !== "OPEN") {
      const e: any = new Error("session closed");
      e.status = 409;
      throw e;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      tagId: input.tagId,
      tableNumber: sess.tableNumber,
      createdAt: now(),
      updatedAt: now(),
      notes: input.notes ?? "",
      status: "SUBMITTED",
      items: input.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        station: normalizeStation(i.station),
        status: "PENDING" as ItemStatus,
      })),
    };

    s.orders[order.id] = order;
    sess.updatedAt = now();
    sess.expiresAt = now() + SESSION_IDLE_MS;

    audit("customer", "order.submitted", { orderId: order.id, tagId: order.tagId, sessionId: order.sessionId });
    publish({ type: "order.submitted", orderId: order.id, tagId: order.tagId, sessionId: order.sessionId });

    return order;
  });
}

export function listQueue(station: Station) {
  return mutateStore((s) => {
    const orders = Object.values(s.orders)
      .filter(o => o.status !== "CANCELLED" && o.status !== "CLOSED")
      .filter(o => o.items.some(i => i.station === station && i.status !== "DELIVERED" && i.status !== "CANCELLED"))
      .sort((a,b) => a.createdAt - b.createdAt);

    return orders;
  });
}

export function markStationReady(orderId: string, station: Station) {
  return mutateStore((s) => {
    const o = s.orders[orderId];
    if (!o) {
      const e: any = new Error("order not found");
      e.status = 404;
      throw e;
    }

    for (const item of o.items) {
      if (item.station === station && item.status === "PENDING") {
        item.status = "READY";
      }
    }

    const { allReady } = itemReadyStatus(o.items);
    o.status = allReady ? "READY" : o.status;
    o.updatedAt = now();

    audit("staff", "order.station_ready", { orderId, station });
    publish({ type: "order.station_ready", orderId, station });

    return o;
  });
}

export function deliverOrder(orderId: string) {
  return mutateStore((s) => {
    const o = s.orders[orderId];
    if (!o) {
      const e: any = new Error("order not found");
      e.status = 404;
      throw e;
    }

    // Deliver everything that is READY or PENDING (waiter confirms actual delivery)
    for (const item of o.items) {
      if (item.status !== "CANCELLED") item.status = "DELIVERED";
    }

    o.status = "DELIVERED";
    o.updatedAt = now();

    // If its session is open, keep it open (dessert possible). Closing is explicit.
    audit("staff", "order.delivered", { orderId });
    publish({ type: "order.delivered", orderId });

    return o;
  });
}

export function cancelOrder(orderId: string) {
  return mutateStore((s) => {
    const o = s.orders[orderId];
    if (!o) return null;
    o.status = "CANCELLED";
    o.updatedAt = now();
    for (const item of o.items) item.status = "CANCELLED";
    audit("staff", "order.cancelled", { orderId });
    publish({ type: "order.cancelled", orderId });
    return o;
  });
}

export function reassignTag(oldTagId: string, newTagId: string) {
  return mutateStore((s) => {
    // Move OPEN session
    const session = Object.values(s.sessions).find(x => x.tagId === oldTagId && x.status === "OPEN");
    if (session) {
      session.tagId = newTagId;
      session.updatedAt = now();
      session.expiresAt = now() + SESSION_IDLE_MS;
    }
    // Move orders
    for (const o of Object.values(s.orders)) {
      if (o.tagId === oldTagId && o.status !== "CLOSED") {
        o.tagId = newTagId;
        o.updatedAt = now();
      }
    }
    audit("staff", "tag.reassigned", { oldTagId, newTagId });
    publish({ type: "tag.reassigned", oldTagId, newTagId });
    return { ok: true };
  });
}

export function mergeSessions(fromTagId: string, intoTagId: string) {
  return mutateStore((s) => {
    const from = Object.values(s.sessions).find(x => x.tagId === fromTagId && x.status === "OPEN");
    const into = Object.values(s.sessions).find(x => x.tagId === intoTagId && x.status === "OPEN");
    if (!from || !into) {
      const e: any = new Error("missing open sessions");
      e.status = 404;
      throw e;
    }

    for (const o of Object.values(s.orders)) {
      if (o.sessionId === from.id && o.status !== "CLOSED") {
        o.sessionId = into.id;
        o.tagId = into.tagId;
        o.tableNumber = into.tableNumber;
        o.updatedAt = now();
      }
    }

    from.status = "CLOSED";
    from.closedAt = now();
    from.updatedAt = now();

    audit("staff", "session.merged", { fromTagId, intoTagId, fromSession: from.id, intoSession: into.id });
    publish({ type: "session.merged", fromTagId, intoTagId });
    return { ok: true };
  });
}

export function getBill(tagId: string) {
  return mutateStore((s) => {
    const session = Object.values(s.sessions).find(x => x.tagId === tagId && x.status === "OPEN")
      ?? Object.values(s.sessions).find(x => x.tagId === tagId)
      ?? null;

    const orders = Object.values(s.orders)
      .filter(o => o.tagId === tagId)
      .filter(o => o.status !== "CANCELLED")
      .sort((a,b) => a.createdAt - b.createdAt);

    const lineMap = new Map<string, { name: string; qty: number; price: number; subtotal: number }>();

    for (const o of orders) {
      for (const i of o.items) {
        if (i.status === "CANCELLED") continue;
        const key = i.id;
        const prev = lineMap.get(key) ?? { name: i.name, qty: 0, price: i.price, subtotal: 0 };
        const addQty = i.quantity;
        prev.qty += addQty;
        prev.price = i.price;
        prev.subtotal += i.price * addQty;
        lineMap.set(key, prev);
      }
    }

    const lines = [...lineMap.values()].sort((a,b) => a.name.localeCompare(b.name));
    const total = lines.reduce((sum, l) => sum + l.subtotal, 0);

    return {
      tagId,
      tableNumber: session?.tableNumber ?? null,
      sessionId: session?.id ?? null,
      lines,
      total,
      orderCount: orders.length,
    };
  });
}

export function closeTab(tagId: string) {
  const session = closeSessionByTag(tagId);
  if (!session) return null;

  // Mark all orders for this session as CLOSED
  return mutateStore((s) => {
    for (const o of Object.values(s.orders)) {
      if (o.sessionId === session.id && o.status !== "CANCELLED") {
        o.status = "CLOSED";
        o.updatedAt = now();
      }
    }
    audit("staff", "tab.closed", { tagId, sessionId: session.id });
    publish({ type: "tab.closed", tagId, sessionId: session.id });
    return { ok: true, sessionId: session.id };
  });
}
