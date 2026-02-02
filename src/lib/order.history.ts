// src/lib/order.history.ts
import fs from "fs";
import path from "path";
import type { KitchenOrder } from "./kitchen.types";

const FILE = path.join(process.cwd(), "data", "history.json");

export function archiveOrder(order: KitchenOrder) {
  const existing = fs.existsSync(FILE)
    ? JSON.parse(fs.readFileSync(FILE, "utf-8"))
    : [];
  existing.push({ ...order, archivedAt: Date.now() });
  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2));
}
