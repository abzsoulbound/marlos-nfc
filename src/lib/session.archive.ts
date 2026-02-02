// session.archive.ts
// Archive completed orders for history / reporting later.

import type { Order } from "./order.types";

const archivedOrders: Order[] = [];

export function archiveOrder(order: Order): void {
  archivedOrders.push(order);
}

export function getArchivedOrders(): Order[] {
  return archivedOrders;
}
