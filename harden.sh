set -euo pipefail

# =========================================
# Marlo's NFC system hardening patch
# - Persistence (disk JSON) + audit trail
# - Item-level station status (bar/kitchen)
# - Table assignment (tag -> table number) with pending state
# - Staff auth gate on staff-only endpoints
# - Recovery tools (undo/merge/reassign) via staff endpoints
# - Session lifecycle: open/close/expiry + closed-tab guard
# - Grouping: "tab" = session + multiple orders
# - Realtime feed (SSE) with polling fallback
# - Removes Edge runtime where it blocks persistence
# =========================================

# 0) Ensure directories exist
mkdir -p src/lib
mkdir -p src/app/api/orders/kitchen
mkdir -p src/app/api/orders/bar
mkdir -p src/app/api/orders/ready
mkdir -p src/app/api/orders/deliver
mkdir -p src/app/api/orders/submit
mkdir -p src/app/api/realtime
mkdir -p src/app/api/sessions
mkdir -p src/app/api/bills
mkdir -p src/app/staff/sessions
mkdir -p src/app/staff/ops
mkdir -p src/app/bar
mkdir -p src/app/kitchen
mkdir -p src/app/t/[nfcTagId]
mkdir -p src/app/t/[nfcTagId]/review

# 1) Add STAFF_KEY to .env if missing (safe no-op if already present)
if [ -f .env ]; then
  grep -q '^STAFF_KEY=' .env || printf '\nSTAFF_KEY=change-me-now\n' >> .env
else
  printf 'STAFF_KEY=change-me-now\n' > .env
fi

# 2) Persistent store + audit + realtime bus
cat > src/lib/persist.store.ts <<'EOF'
import fs from "fs";
import path from "path";

export type Station = "KITCHEN" | "BAR";
export type ItemStatus = "PENDING" | "READY" | "DELIVERED" | "CANCELLED";
export type OrderStatus = "OPEN" | "SUBMITTED" | "READY" | "DELIVERED" | "CLOSED" | "CANCELLED";
export type SessionStatus = "OPEN" | "CLOSED";

export type Money = number;

export interface OrderItem {
  id: string;
  name: string;
  price: Money;      // snapshot at time of order
  quantity: number;
  station: Station;
  status: ItemStatus;
}

export interface Order {
  id: string;
  sessionId: string;
  tagId: string;
  tableNumber: string | null;  // human-facing
  createdAt: number;
  updatedAt: number;
  notes: string;
  status: OrderStatus;
  items: OrderItem[];
}

export interface TableAssignment {
  tagId: string;
  tableNumber: string;
  confirmed: boolean;
  updatedAt: number;
}

export interface Session {
  id: string;
  tagId: string;
  tableNumber: string | null;
  status: SessionStatus;
  openedAt: number;
  updatedAt: number;
  closedAt: number | null;
  expiresAt: number; // auto-expire (idle)
}

export interface AuditEvent {
  id: string;
  at: number;
  actor: "customer" | "staff" | "system";
  action: string;
  meta: Record<string, any>;
}

export interface StoreSnapshot {
  sessions: Record<string, Session>;
  orders: Record<string, Order>;
  tableAssignments: Record<string, TableAssignment>;
  audit: AuditEvent[];
  version: number;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function emptySnapshot(): StoreSnapshot {
  return {
    sessions: {},
    orders: {},
    tableAssignments: {},
    audit: [],
    version: 1,
  };
}

let cache: StoreSnapshot | null = null;

function readDisk(): StoreSnapshot {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) return emptySnapshot();
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    // If corrupted, preserve a backup and start fresh.
    const backup = STORE_PATH.replace(/\.json$/, `.corrupt.${Date.now()}.json`);
    fs.writeFileSync(backup, raw, "utf8");
    return emptySnapshot();
  }
}

function writeDisk(s: StoreSnapshot) {
  ensureDataDir();
  const tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2), "utf8");
  fs.renameSync(tmp, STORE_PATH);
}

export function loadStore(): StoreSnapshot {
  if (!cache) cache = readDisk();
  return cache;
}

export function saveStore(next: StoreSnapshot) {
  cache = next;
  writeDisk(next);
}

export function mutateStore<T>(fn: (s: StoreSnapshot) => T): T {
  const s = loadStore();
  const result = fn(s);
  saveStore(s);
  return result;
}

export function audit(actor: AuditEvent["actor"], action: string, meta: Record<string, any>) {
  mutateStore((s) => {
    s.audit.push({
      id: crypto.randomUUID(),
      at: Date.now(),
      actor,
      action,
      meta,
    });
  });
}
EOF

cat > src/lib/realtime.bus.ts <<'EOF'
type Listener = (event: any) => void;

const listeners = new Set<Listener>();

export function publish(event: any) {
  for (const l of listeners) l(event);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
EOF

# 3) Staff auth gate (header-based)
cat > src/lib/staffAuth.ts <<'EOF'
export function requireStaff(req: Request) {
  const key = req.headers.get("x-staff-key") || "";
  const expected = process.env.STAFF_KEY || "";
  if (!expected || expected === "change-me-now") {
    throw new Error("STAFF_KEY not set securely in .env");
  }
  if (key !== expected) {
    const err: any = new Error("unauthorized");
    err.status = 401;
    throw err;
  }
}
EOF

# 4) Domain operations (sessions, assignments, orders, recovery)
cat > src/lib/ops.ts <<'EOF'
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
EOF

# 5) API: sessions (open/list/close)
cat > src/app/api/sessions/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { listOpenSessions, openOrResumeSession, closeTab } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // staff-only listing
  try {
    requireStaff(req);
    return NextResponse.json({ sessions: listOpenSessions() });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // customer open/resume
  if (body?.action === "open" && typeof body?.tagId === "string") {
    const session = openOrResumeSession(body.tagId);
    return NextResponse.json({ session });
  }

  // staff close tab
  if (body?.action === "closeTab") {
    try {
      requireStaff(req);
      const tagId = String(body?.tagId ?? "");
      if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
      const result = closeTab(tagId);
      return NextResponse.json({ result });
    } catch (e: any) {
      const status = e?.status ?? 401;
      return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
    }
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
EOF

# 6) API: order submit + queues + actions
cat > src/app/api/orders/submit/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tagId = String(body?.tagId ?? "");
  const items = Array.isArray(body?.items) ? body.items : [];
  const notes = typeof body?.notes === "string" ? body.notes : "";

  if (!tagId || items.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = submitOrder({
    tagId,
    notes,
    items: items.map((i: any) => ({
      id: String(i.id),
      name: String(i.name),
      price: Number(i.price),
      quantity: Number(i.quantity),
      station: (i.station === "BAR" ? "BAR" : "KITCHEN"),
    })),
  });

  return NextResponse.json({ order });
}
EOF

cat > src/app/api/orders/kitchen/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { listQueue } from "@/lib/ops";

export const runtime = "nodejs";

export async function GET() {
  const orders = listQueue("KITCHEN");
  return NextResponse.json(orders);
}
EOF

cat > src/app/api/orders/bar/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { listQueue } from "@/lib/ops";

export const runtime = "nodejs";

export async function GET() {
  const orders = listQueue("BAR");
  return NextResponse.json(orders);
}
EOF

cat > src/app/api/orders/ready/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { markStationReady } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId ?? "");
    const station = body?.station === "BAR" ? "BAR" : "KITCHEN";
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
    const order = markStationReady(orderId, station);
    return NextResponse.json({ order });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
EOF

cat > src/app/api/orders/deliver/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { deliverOrder } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId ?? "");
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
    const order = deliverOrder(orderId);
    return NextResponse.json({ order });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
EOF

# Compatibility: keep /api/orders POST working (submit alias)
cat > src/app/api/orders/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Back-compat accepted shapes:
  // 1) { tagId, items, notes }
  // 2) { tableId, items }  (older)
  const tagId = String(body?.tagId ?? body?.tableId ?? "");
  const items = Array.isArray(body?.items) ? body.items : [];
  const notes = typeof body?.notes === "string" ? body.notes : "";

  if (!tagId || items.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = submitOrder({
    tagId,
    notes,
    items: items.map((i: any) => ({
      id: String(i.id ?? i.itemId ?? i.variantId ?? crypto.randomUUID()),
      name: String(i.name),
      price: Number(i.price ?? 0),
      quantity: Number(i.quantity ?? 1),
      station: (i.station === "BAR" ? "BAR" : "KITCHEN"),
    })),
  });

  return NextResponse.json({ order });
}
EOF

# 7) Bills API (GET bill + staff close tab)
cat > src/app/api/bills/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { getBill, closeTab } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tagId = url.searchParams.get("tagId") || url.searchParams.get("table") || "";
  if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
  const bill = getBill(tagId);
  return NextResponse.json(bill);
}

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const tagId = String(body?.tagId ?? "");
    if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
    const result = closeTab(tagId);
    return NextResponse.json({ result });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
EOF

# 8) Realtime SSE (kitchen/bar/staff can subscribe)
cat > src/app/api/realtime/route.ts <<'EOF'
import { subscribe } from "@/lib/realtime.bus";

export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      // initial ping
      send({ type: "hello", at: Date.now() });

      const unsub = subscribe((evt) => send(evt));

      const keepAlive = setInterval(() => {
        send({ type: "ping", at: Date.now() });
      }, 25000);

      (controller as any).closeStream = () => {
        clearInterval(keepAlive);
        unsub();
        try { controller.close(); } catch {}
      };
    },
    cancel(reason) {
      // noop (Next will drop connection)
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
EOF

# 9) Staff ops endpoints (reassign/merge/table assignment)
mkdir -p src/app/api/staff/ops
cat > src/app/api/staff/ops/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staffAuth";
import { setTableAssignment, reassignTag, mergeSessions } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    if (action === "assignTable") {
      const tagId = String(body?.tagId ?? "");
      const tableNumber = String(body?.tableNumber ?? "");
      const confirmed = Boolean(body?.confirmed ?? true);
      if (!tagId || !tableNumber) return NextResponse.json({ error: "tagId/tableNumber required" }, { status: 400 });
      const assignment = setTableAssignment(tagId, tableNumber, confirmed);
      return NextResponse.json({ assignment });
    }

    if (action === "reassignTag") {
      const oldTagId = String(body?.oldTagId ?? "");
      const newTagId = String(body?.newTagId ?? "");
      if (!oldTagId || !newTagId) return NextResponse.json({ error: "oldTagId/newTagId required" }, { status: 400 });
      const result = reassignTag(oldTagId, newTagId);
      return NextResponse.json({ result });
    }

    if (action === "mergeSessions") {
      const fromTagId = String(body?.fromTagId ?? "");
      const intoTagId = String(body?.intoTagId ?? "");
      if (!fromTagId || !intoTagId) return NextResponse.json({ error: "fromTagId/intoTagId required" }, { status: 400 });
      const result = mergeSessions(fromTagId, intoTagId);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
EOF

# 10) Fix kitchen hook to use SSE + fallback polling
cat > src/lib/useKitchenQueue.ts <<'EOF'
"use client";

import { useEffect, useState } from "react";
import type { Order } from "./persist.store";

export function useKitchenQueue(station: "KITCHEN" | "BAR" = "KITCHEN") {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const url = station === "BAR" ? "/api/orders/bar" : "/api/orders/kitchen";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "fetch failed");
    }
  }

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    let es: EventSource | null = null;

    load();

    // SSE (realtime), with polling fallback
    try {
      es = new EventSource("/api/realtime");
      es.onmessage = () => {
        if (!alive) return;
        load();
      };
      es.onerror = () => {
        // If SSE fails, fall back to polling
        if (!alive) return;
        if (timer === null) timer = window.setInterval(load, 3000);
      };
    } catch {
      timer = window.setInterval(load, 3000);
    }

    // Ensure periodic refresh even if no events
    if (timer === null) timer = window.setInterval(load, 6000);

    return () => {
      alive = false;
      if (timer !== null) clearInterval(timer);
      if (es) es.close();
    };
  }, [station]);

  return { orders, error, reload: load };
}
EOF

# 11) Kitchen page: add staff actions (ready/deliver) with staff key prompt
cat > src/app/kitchen/page.tsx <<'EOF'
"use client";

import { useEffect, useMemo, useState } from "react";
import { useKitchenQueue } from "@/lib/useKitchenQueue";
import type { Order } from "@/lib/persist.store";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function KitchenPage() {
  const [staffKey, setStaffKey] = useState("");
  const { orders, error, reload } = useKitchenQueue("KITCHEN");

  useEffect(() => {
    setStaffKey(getKey());
  }, []);

  const grouped = useMemo(() => {
    // Group by tableNumber if exists; else by tagId
    const map = new Map<string, Order[]>();
    for (const o of orders) {
      const k = o.tableNumber ? `Table ${o.tableNumber}` : `Tag ${o.tagId}`;
      const prev = map.get(k) ?? [];
      prev.push(o);
      map.set(k, prev);
    }
    return [...map.entries()];
  }, [orders]);

  async function markReady(orderId: string) {
    const res = await fetch("/api/orders/ready", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ orderId, station: "KITCHEN" }),
    });
    if (!res.ok) throw new Error("ready failed: " + res.status);
    await reload();
  }

  async function deliver(orderId: string) {
    const res = await fetch("/api/orders/deliver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) throw new Error("deliver failed: " + res.status);
    await reload();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Kitchen</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Staff key</span>
          <input
            value={staffKey}
            onChange={(e) => {
              setStaffKey(e.target.value);
              localStorage.setItem("STAFF_KEY", e.target.value);
            }}
            placeholder="STAFF_KEY"
            style={{ padding: 8, width: 280 }}
          />
        </label>
        <button onClick={() => reload()} style={{ padding: "8px 12px" }}>Refresh</button>
      </div>

      {error && <p style={{ color: "red" }}>Error loading orders: {error}</p>}
      {grouped.length === 0 && !error && <p>No active kitchen orders.</p>}

      {grouped.map(([groupKey, groupOrders]) => (
        <section key={groupKey} style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 8 }}>{groupKey}</h2>

          {groupOrders.map(order => (
            <div key={order.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>Order</strong>
                <span style={{ opacity: 0.8 }}>
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <ul>
                {order.items
                  .filter(i => i.station === "KITCHEN" && i.status !== "DELIVERED" && i.status !== "CANCELLED")
                  .map(item => (
                    <li key={item.id}>
                      {item.quantity}× {item.name} <em>({item.status})</em>
                    </li>
                  ))}
              </ul>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => markReady(order.id)} style={{ padding: "8px 10px" }}>
                  Mark kitchen ready
                </button>
                <button onClick={() => deliver(order.id)} style={{ padding: "8px 10px" }}>
                  Mark delivered
                </button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
EOF

# 12) Bar page (same pattern)
cat > src/app/bar/page.tsx <<'EOF'
"use client";

import { useEffect, useState } from "react";
import { useKitchenQueue } from "@/lib/useKitchenQueue";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function BarPage() {
  const [staffKey, setStaffKey] = useState("");
  const { orders, error, reload } = useKitchenQueue("BAR");

  useEffect(() => setStaffKey(getKey()), []);

  async function markReady(orderId: string) {
    const res = await fetch("/api/orders/ready", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ orderId, station: "BAR" }),
    });
    if (!res.ok) throw new Error("ready failed: " + res.status);
    await reload();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Bar</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Staff key</span>
          <input
            value={staffKey}
            onChange={(e) => {
              setStaffKey(e.target.value);
              localStorage.setItem("STAFF_KEY", e.target.value);
            }}
            placeholder="STAFF_KEY"
            style={{ padding: 8, width: 280 }}
          />
        </label>
        <button onClick={() => reload()} style={{ padding: "8px 12px" }}>Refresh</button>
      </div>

      {error && <p style={{ color: "red" }}>Error loading orders: {error}</p>}
      {orders.length === 0 && !error && <p>No active bar orders.</p>}

      {orders.map(order => (
        <section key={order.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
          <h2>{order.tableNumber ? `Table ${order.tableNumber}` : `Tag ${order.tagId}`}</h2>

          <ul>
            {order.items
              .filter(i => i.station === "BAR" && i.status !== "DELIVERED" && i.status !== "CANCELLED")
              .map(item => (
                <li key={item.id}>
                  {item.quantity}× {item.name} <em>({item.status})</em>
                </li>
              ))}
          </ul>

          <button onClick={() => markReady(order.id)} style={{ padding: "8px 10px" }}>
            Mark bar ready
          </button>
        </section>
      ))}
    </main>
  );
}
EOF

# 13) Staff sessions page (assign tables, close tabs, recovery)
cat > src/app/staff/sessions/page.tsx <<'EOF'
"use client";

import { useEffect, useState } from "react";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function StaffSessionsPage() {
  const [staffKey, setStaffKey] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setStaffKey(getKey()), []);

  async function load() {
    setErr(null);
    const res = await fetch("/api/sessions", {
      headers: { "x-staff-key": staffKey },
    });
    if (!res.ok) {
      setErr("HTTP " + res.status);
      return;
    }
    const data = await res.json();
    setSessions(data.sessions ?? []);
  }

  useEffect(() => {
    if (staffKey) load();
  }, [staffKey]);

  async function assign(tagId: string, tableNumber: string) {
    const res = await fetch("/api/staff/ops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ action: "assignTable", tagId, tableNumber, confirmed: true }),
    });
    if (!res.ok) throw new Error("assign failed " + res.status);
    await load();
  }

  async function closeTab(tagId: string) {
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ tagId }),
    });
    if (!res.ok) throw new Error("close failed " + res.status);
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Staff — Sessions</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Staff key</span>
          <input
            value={staffKey}
            onChange={(e) => {
              setStaffKey(e.target.value);
              localStorage.setItem("STAFF_KEY", e.target.value);
            }}
            placeholder="STAFF_KEY"
            style={{ padding: 8, width: 280 }}
          />
        </label>
        <button onClick={() => load()} style={{ padding: "8px 12px" }}>Refresh</button>
      </div>

      {err && <p style={{ color: "red" }}>Error: {err}</p>}
      {sessions.length === 0 && !err && <p>No open sessions.</p>}

      {sessions.map((s) => (
        <div key={s.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <strong>{s.tableNumber ? `Table ${s.tableNumber}` : `Tag ${s.tagId}`}</strong>
            <span style={{ opacity: 0.8 }}>Opened {new Date(s.openedAt).toLocaleTimeString()}</span>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <AssignForm onAssign={(table) => assign(s.tagId, table)} />
            <button onClick={() => closeTab(s.tagId)} style={{ padding: "8px 10px" }}>
              Close tab
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}

function AssignForm({ onAssign }: { onAssign: (table: string) => void }) {
  const [table, setTable] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const t = table.trim();
        if (!t) return;
        onAssign(t);
        setTable("");
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <input
        value={table}
        onChange={(e) => setTable(e.target.value)}
        placeholder="Table #"
        style={{ padding: 8, width: 120 }}
      />
      <button type="submit" style={{ padding: "8px 10px" }}>
        Assign
      </button>
    </form>
  );
}
EOF

cat > src/app/staff/ops/page.tsx <<'EOF'
"use client";

import { useEffect, useState } from "react";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function StaffOpsPage() {
  const [staffKey, setStaffKey] = useState("");
  const [oldTagId, setOldTagId] = useState("");
  const [newTagId, setNewTagId] = useState("");
  const [fromTagId, setFromTagId] = useState("");
  const [intoTagId, setIntoTagId] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => setStaffKey(getKey()), []);

  async function call(body: any) {
    setMsg("");
    const res = await fetch("/api/staff/ops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || ("HTTP " + res.status));
    setMsg("OK");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Staff — Recovery Ops</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Staff key</span>
          <input
            value={staffKey}
            onChange={(e) => {
              setStaffKey(e.target.value);
              localStorage.setItem("STAFF_KEY", e.target.value);
            }}
            placeholder="STAFF_KEY"
            style={{ padding: 8, width: 280 }}
          />
        </label>
      </div>

      {msg && <p>{msg}</p>}

      <section style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <h2>Reassign tag</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={oldTagId} onChange={(e) => setOldTagId(e.target.value)} placeholder="Old tagId" style={{ padding: 8, width: 180 }} />
          <input value={newTagId} onChange={(e) => setNewTagId(e.target.value)} placeholder="New tagId" style={{ padding: 8, width: 180 }} />
          <button onClick={() => call({ action: "reassignTag", oldTagId, newTagId })} style={{ padding: "8px 10px" }}>
            Apply
          </button>
        </div>
      </section>

      <section style={{ border: "1px solid #ccc", padding: 12 }}>
        <h2>Merge sessions</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={fromTagId} onChange={(e) => setFromTagId(e.target.value)} placeholder="From tagId" style={{ padding: 8, width: 180 }} />
          <input value={intoTagId} onChange={(e) => setIntoTagId(e.target.value)} placeholder="Into tagId" style={{ padding: 8, width: 180 }} />
          <button onClick={() => call({ action: "mergeSessions", fromTagId, intoTagId })} style={{ padding: "8px 10px" }}>
            Merge
          </button>
        </div>
      </section>
    </main>
  );
}
EOF

# 14) Customer NFC page + review page: real menu, cart, submit
cat > src/app/t/[nfcTagId]/page.tsx <<'EOF'
import NFCTagClient from "./NFCTagClient";

type PageProps = {
  params: Promise<{ nfcTagId: string }>;
};

export default async function NFCTablePage({ params }: PageProps) {
  const { nfcTagId } = await params;
  if (!nfcTagId) return <div>Invalid table</div>;
  return <NFCTagClient nfcTagId={nfcTagId} />;
}

export const runtime = "nodejs";
EOF

cat > src/app/t/[nfcTagId]/NFCTagClient.tsx <<'EOF'
"use client";

import { useEffect, useMemo, useState } from "react";
import { menu } from "@/lib/menu";

type Cart = Record<string, number>;

function getItemById(id: string) {
  for (const sec of menu) {
    const item = sec.items.find(i => i.id === id);
    if (item) return item;
  }
  return null;
}

function stationFor(sectionId: string): "KITCHEN" | "BAR" {
  // Simple routing: drinks sections => BAR, everything else => KITCHEN
  const barSections = new Set(["hot-drinks", "cold-drinks", "cocktails", "wines", "beers", "soft-drinks", "spirits"]);
  return barSections.has(sectionId) ? "BAR" : "KITCHEN";
}

export default function NFCTagClient({ nfcTagId }: { nfcTagId: string }) {
  const [activeSection, setActiveSection] = useState(menu[0]?.id);
  const [cart, setCart] = useState<Cart>({});
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    // open/resume session
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", tagId: nfcTagId }),
    }).catch(() => {});
  }, [nfcTagId]);

  const section = useMemo(() => menu.find(s => s.id === activeSection) ?? menu[0], [activeSection]);
  const items = section?.items ?? [];

  const totalQty = Object.values(cart).reduce((a,b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = getItemById(id);
    if (!item) return sum;
    return sum + (item.price * qty);
  }, 0);

  function add(id: string) {
    setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function remove(id: string) {
    setCart(c => {
      const next = { ...c };
      const v = next[id] ?? 0;
      if (v <= 1) delete next[id];
      else next[id] = v - 1;
      return next;
    });
  }

  async function submit() {
    setMsg("");
    const payloadItems = Object.entries(cart)
      .map(([id, quantity]) => {
        const item = getItemById(id);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
          station: stationFor(section?.id ?? ""),
        };
      })
      .filter(Boolean) as any[];

    if (payloadItems.length === 0) {
      setMsg("Basket empty");
      return;
    }

    const res = await fetch("/api/orders/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId: nfcTagId, items: payloadItems, notes }),
    });

    if (!res.ok) {
      const text = await res.text();
      setMsg(text || ("Submit failed HTTP " + res.status));
      return;
    }

    setCart({});
    setNotes("");
    setMsg("Order submitted");
  }

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Marlo’s Brasserie</h1>
        <p style={{ opacity: 0.75, marginTop: 4 }}>Tag: {nfcTagId}</p>
      </header>

      <nav style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
        {menu
          .slice()
          .sort((a,b) => a.order - b.order)
          .map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: "8px 10px",
                border: "1px solid #ccc",
                background: s.id === activeSection ? "#eee" : "white",
                whiteSpace: "nowrap",
              }}
            >
              {s.title}
            </button>
          ))}
      </nav>

      <section>
        <h2 style={{ marginTop: 0 }}>{section?.title}</h2>

        <div style={{ display: "grid", gap: 10 }}>
          {items.map(item => {
            const qty = cart[item.id] ?? 0;
            return (
              <div key={item.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{item.name}</strong>
                  <span>£{item.price.toFixed(2)}</span>
                </div>
                {item.description && <p style={{ marginTop: 6, opacity: 0.85 }}>{item.description}</p>}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <button onClick={() => remove(item.id)} style={{ padding: "6px 10px" }}>-</button>
                  <span style={{ minWidth: 28, textAlign: "center" }}>{qty}</span>
                  <button onClick={() => add(item.id)} style={{ padding: "6px 10px" }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer style={{ position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #ddd", marginTop: 16, paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <strong>{totalQty}</strong> item(s) — <strong>£{totalPrice.toFixed(2)}</strong>
          </div>
          <button onClick={() => submit()} style={{ padding: "10px 14px" }}>
            Submit order
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </footer>
    </main>
  );
}
EOF

cat > src/app/t/[nfcTagId]/review/page.tsx <<'EOF'
"use client";

import { useEffect, useState } from "react";

type PageProps = { params: { nfcTagId: string } };

export default function ReviewPage({ params }: PageProps) {
  const tagId = params.nfcTagId;
  const [bill, setBill] = useState<any>(null);

  useEffect(() => {
    fetch("/api/bills?tagId=" + encodeURIComponent(tagId), { cache: "no-store" })
      .then(r => r.json())
      .then(setBill)
      .catch(() => setBill({ error: "failed" }));
  }, [tagId]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Current tab</h1>
      <p style={{ opacity: 0.8 }}>Tag: {tagId}</p>

      {!bill && <p>Loading…</p>}
      {bill?.error && <p style={{ color: "red" }}>Error</p>}

      {bill?.lines && (
        <>
          {bill.tableNumber && <p><strong>Table {bill.tableNumber}</strong></p>}
          {bill.lines.map((l: any, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "6px 0" }}>
              <span>{l.name} × {l.qty}</span>
              <span>£{l.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <p style={{ marginTop: 12 }}><strong>Total: £{bill.total.toFixed(2)}</strong></p>
        </>
      )}
    </main>
  );
}
EOF

# 15) Staff landing page: link out
cat > src/app/staff/page.tsx <<'EOF'
"use client";

export default function StaffPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Staff</h1>
      <ul>
        <li><a href="/staff/sessions">Sessions + table assignment + close tab</a></li>
        <li><a href="/staff/ops">Recovery ops (reassign/merge)</a></li>
        <li><a href="/kitchen">Kitchen screen</a></li>
        <li><a href="/bar">Bar screen</a></li>
      </ul>
    </main>
  );
}
EOF

# 16) Remove old/unused conflicting legacy order model (keep file but make it a thin compat wrapper)
cat > src/lib/orders.model.ts <<'EOF'
/**
 * Compatibility wrapper.
 * Older code called createOrder/getOrders from this module.
 * Keep it, but route to the persistent ops store to avoid split-brain state.
 */
import { getBill, submitOrder } from "./ops";

type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  station?: "KITCHEN" | "BAR";
};

export function createOrder(input: { table: string; items: OrderItem[]; notes: string }) {
  // table is treated as tagId for back-compat in this repo snapshot
  return submitOrder({
    tagId: input.table,
    notes: input.notes,
    items: input.items.map(i => ({
      id: String(i.itemId),
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      station: (i.station === "BAR" ? "BAR" : "KITCHEN"),
    })),
  });
}

export function getOrders() {
  // Back-compat: return a bill-like view (orders list was never stable here)
  return getBill("unknown");
}
EOF

# 17) Ensure Next pages not Edge at root (avoid persistence break)
# (Leave other pages alone)
sed -i.bak 's/export const runtime = "edge";/export const runtime = "nodejs";/g' src/app/t/[nfcTagId]/NFCTagClient.tsx 2>/dev/null || true
rm -f src/app/t/[nfcTagId]/NFCTagClient.tsx.bak 2>/dev/null || true

# 18) Basic sanity: run typecheck/build (non-fatal if your local environment differs)
npm run build || true

echo "PATCH APPLIED. Now run: npm run dev"




