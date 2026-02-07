import fs from "fs";
import path from "path";
import type { KitchenOrder } from "./kitchen.types";

const FILE = path.join(process.cwd(), "data", "history.json");

type ArchivedOrder = KitchenOrder & {
  archivedAt: number;
};

function readHistory(): ArchivedOrder[] {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

export function archiveOrder(order: KitchenOrder) {
  const existing = readHistory();
  existing.push({ ...order, archivedAt: Date.now() });
  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2));
}

export function getLatestOrderForTag(tagId: string): ArchivedOrder | null {
  const history = readHistory()
    .filter(o => o.tagId === tagId)
    .sort((a, b) => b.archivedAt - a.archivedAt);

  return history[0] ?? null;
}
