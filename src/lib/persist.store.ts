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
