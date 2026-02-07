import {
  mutateStore,
  audit,
  type Session,
  type Order,
  type OrderItem,
  type Station,
} from "./persist.store";
import { publish } from "./realtime.bus";

const SESSION_IDLE_MS = 1000 * 60 * 90;

function now() {
  return Date.now();
}

export function openOrResumeSession(tagId: string): Session {
  return mutateStore((s) => {
    let session = Object.values(s.sessions).find(
      (x) => x.tagId === tagId && x.status === "OPEN"
    );

    if (!session) {
      session = {
        id: crypto.randomUUID(),
        tagId,
        tableNumber: tagId.replace(/^0+/, ""),
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
    }

    return session;
  });
}

export function listOpenSessions(): Session[] {
  return mutateStore((s) =>
    Object.values(s.sessions)
      .filter((x) => x.status === "OPEN")
      .sort((a, b) => a.openedAt - b.openedAt)
  );
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

export function closeTab(tagId: string) {
  return closeSessionByTag(tagId);
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
}): Order {
  const session = openOrResumeSession(input.tagId);

  return mutateStore((s) => {
    const order: Order = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      tagId: input.tagId,
      tableNumber: session.tableNumber,
      createdAt: now(),
      updatedAt: now(),
      notes: input.notes ?? "",
      status: "OPEN",
      items: input.items.map(
        (i) =>
          ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            station: i.station,
            status: "PENDING",
          }) as OrderItem
      ),
    };

    s.orders[order.id] = order;

    audit("system", "order.submitted", {
      orderId: order.id,
      tagId: order.tagId,
      sessionId: session.id,
    });

    publish({
      type: "order.submitted",
      orderId: order.id,
      tagId: order.tagId,
      sessionId: session.id,
    });

    return order;
  });
}

export function listQueue(station: Station) {
  return mutateStore((s) =>
    Object.values(s.orders)
      .filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED")
      .map((o) => ({
        ...o,
        items: o.items.filter(
          (i) => i.station === station && i.status !== "CANCELLED"
        ),
      }))
      .filter((o) => o.items.length > 0)
      .sort((a, b) => a.createdAt - b.createdAt)
  );
}

export function markStationReady(orderId: string, station: Station) {
  return mutateStore((s) => {
    const order = s.orders[orderId];
    if (!order) return null;

    let changed = false;

    for (const item of order.items) {
      if (item.station === station && item.status === "PENDING") {
        item.status = "READY";
        changed = true;
      }
    }

    if (changed) {
      order.updatedAt = now();
      const allReady = order.items.every((i) => i.status === "READY");
      order.status = allReady ? "READY" : "OPEN";

      audit("staff", "station.ready", { orderId, station });
      publish({
        type: "order.updated",
        orderId,
        tagId: order.tagId,
        sessionId: order.sessionId,
      });
    }

    return order;
  });
}

export function deliverOrder(orderId: string) {
  return mutateStore((s) => {
    const order = s.orders[orderId];
    if (!order) return null;

    order.status = "DELIVERED";
    order.updatedAt = now();

    audit("staff", "order.delivered", { orderId });
    publish({
      type: "order.updated",
      orderId,
      tagId: order.tagId,
      sessionId: order.sessionId,
    });

    return order;
  });
}

export function cancelOrder(orderId: string) {
  return mutateStore((s) => {
    const order = s.orders[orderId];
    if (!order) return null;

    order.status = "CANCELLED";
    order.updatedAt = now();
    for (const i of order.items) i.status = "CANCELLED";

    audit("staff", "order.cancelled", { orderId });
    publish({
      type: "order.updated",
      orderId,
      tagId: order.tagId,
      sessionId: order.sessionId,
    });

    return order;
  });
}

export function getBill(tagId: string) {
  return mutateStore((s) => {
    const session = Object.values(s.sessions).find(
      (x) => x.tagId === tagId
    );
    if (!session) return null;

    const orders = Object.values(s.orders).filter(
      (o) => o.sessionId === session.id && o.status !== "CANCELLED"
    );

    const total = orders.reduce(
      (sum, o) =>
        sum +
        o.items.reduce(
          (iSum, i) => iSum + i.price * i.quantity,
          0
        ),
      0
    );

    return { sessionId: session.id, tagId, total, orders };
  });
}

export function setTableAssignment(tagId: string, tableNumber: string) {
  return mutateStore((s) => {
    const session = Object.values(s.sessions).find(
      (x) => x.tagId === tagId && x.status === "OPEN"
    );
    if (!session) return null;

    session.tableNumber = tableNumber;
    session.updatedAt = now();

    audit("staff", "table.assigned", {
      sessionId: session.id,
      tableNumber,
    });

    return session;
  });
}

export function reassignTag(oldTagId: string, newTagId: string) {
  return mutateStore((s) => {
    const session = Object.values(s.sessions).find(
      (x) => x.tagId === oldTagId && x.status === "OPEN"
    );
    if (!session) return null;

    session.tagId = newTagId;
    session.updatedAt = now();

    audit("staff", "tag.reassigned", {
      sessionId: session.id,
      oldTagId,
      newTagId,
    });

    return session;
  });
}

export function mergeSessions(sourceTagId: string, targetTagId: string) {
  return mutateStore((s) => {
    const source = Object.values(s.sessions).find(
      (x) => x.tagId === sourceTagId
    );
    const target = Object.values(s.sessions).find(
      (x) => x.tagId === targetTagId
    );
    if (!source || !target) return null;

    for (const order of Object.values(s.orders)) {
      if (order.sessionId === source.id) {
        order.sessionId = target.id;
        order.updatedAt = now();
      }
    }

    source.status = "MERGED";
    source.closedAt = now();
    source.updatedAt = now();

    audit("staff", "session.merged", {
      sourceSessionId: source.id,
      targetSessionId: target.id,
    });

    return target;
  });
}
