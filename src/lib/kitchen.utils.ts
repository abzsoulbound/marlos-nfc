// src/lib/kitchen.utils.ts

import type {
  KitchenQueue,
  KitchenOrder,
  KitchenItem,
} from "./kitchen.types";

/**
 * In-memory kitchen queue.
 * Stateless, replace later with DB if needed.
 */
const queue: KitchenQueue = {
  orders: [],
};

/**
 * Return full kitchen queue
 */
export function listKitchenQueue(): KitchenQueue {
  return queue;
}

/**
 * Add a new order to kitchen queue
 * Called when an order is placed
 */
export function pushKitchenOrder(order: KitchenOrder): KitchenOrder {
  queue.orders.push(order);
  return order;
}

/**
 * Accept an order (locks it)
 */
export function acceptOrder(orderId: string): KitchenOrder {
  const order = queue.orders.find(o => o.orderId === orderId);
  if (!order) throw new Error("Order not found");

  order.acceptedAt = Date.now();
  order.items.forEach(i => {
    if (i.status === "pending") i.status = "accepted";
  });

  return order;
}

/**
 * Mark individual item completed
 */
export function completeOrderItem(
  orderId: string,
  itemId: string
): KitchenOrder {
  const order = queue.orders.find(o => o.orderId === orderId);
  if (!order) throw new Error("Order not found");

  const item = order.items.find(i => i.itemId === itemId);
  if (!item) throw new Error("Item not found");

  item.status = "completed";

  return order;
}
