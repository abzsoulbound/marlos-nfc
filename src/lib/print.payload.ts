import { Order } from "./domain"

export function buildPrintPayload(order: Order) {
  return {
    orderId: order.id,
    table: order.tableId,
    createdAt: order.createdAt,
    items: order.items.map(i => ({
      name: i.name,
      qty: i.quantity,
    })),
  }
}
