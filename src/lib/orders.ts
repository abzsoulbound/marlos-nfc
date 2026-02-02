import { Order, OrderId, OrderStatus, TableId } from "./domain"
import { transitionOrder } from "./orderState"

/**
 * Single in-memory authority for orders.
 * This will later be swapped for DB without changing callers.
 */
const ORDER_STORE = new Map<OrderId, Order>()

/* ---------- CREATE ---------- */
export function createOrder(order: Order) {
  if (ORDER_STORE.has(order.id)) {
    throw new Error(`Order ${order.id} already exists`)
  }
  ORDER_STORE.set(order.id, order)
}

/* ---------- READ ---------- */
export function getOrder(id: OrderId): Order | undefined {
  return ORDER_STORE.get(id)
}

export function getAllOrders(): Order[] {
  return Array.from(ORDER_STORE.values())
}

export function getKitchenOrders(): Order[] {
  return Array.from(ORDER_STORE.values()).filter(
    o => o.status === OrderStatus.SUBMITTED
  )
}

export function getReadyOrdersByTable(tableId: TableId): Order[] {
  return Array.from(ORDER_STORE.values()).filter(
    o =>
      o.tableId === tableId &&
      o.status === OrderStatus.READY
  )
}

/* ---------- TRANSITIONS ---------- */
export function submitOrder(id: OrderId) {
  const order = requireOrder(id)
  ORDER_STORE.set(id, transitionOrder(order, OrderStatus.SUBMITTED))
}

export function markOrderReady(id: OrderId) {
  const order = requireOrder(id)
  ORDER_STORE.set(id, transitionOrder(order, OrderStatus.READY))
}

export function deliverOrdersForTable(tableId: TableId) {
  for (const order of ORDER_STORE.values()) {
    if (
      order.tableId === tableId &&
      order.status === OrderStatus.READY
    ) {
      ORDER_STORE.set(
        order.id,
        transitionOrder(order, OrderStatus.DELIVERED)
      )
    }
  }
}

export function closeOrder(id: OrderId) {
  const order = requireOrder(id)
  ORDER_STORE.set(id, transitionOrder(order, OrderStatus.CLOSED))
}

/* ---------- INTERNAL ---------- */
function requireOrder(id: OrderId): Order {
  const order = ORDER_STORE.get(id)
  if (!order) throw new Error(`Order ${id} not found`)
  return order
}
