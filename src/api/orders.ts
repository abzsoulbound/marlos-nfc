// orders.ts
// Order read access for UI layers.

import { orderStore } from "../lib/store.repo";
import type { Order } from "../lib/order.types";

export function getOrder(orderId: string): Order | null {
  return orderStore.get(orderId);
}

export function getOpenOrders(): Order[] {
  return orderStore.getAll().filter((o: any) => o.status === "pending");
}
