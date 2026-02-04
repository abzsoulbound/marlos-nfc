import {
  Order,
  OrderId,
  TableId,
  OrderItem,
  OrderStatus,
  Station,
} from "./domain"
import { transitionOrder } from "./orderState"

const orders = new Map<OrderId, Order>()

function now() {
  return Date.now()
}

function generateId(): OrderId {
  return crypto.randomUUID()
}

export function getOpenOrderByTable(tableId: TableId): Order | undefined {
  for (const order of orders.values()) {
    if (order.tableId === tableId && order.status === OrderStatus.OPEN) {
      return order
    }
  }
}

export function createOrAppendOrder(
  tableId: TableId,
  items: OrderItem[]
): Order {
  const existing = getOpenOrderByTable(tableId)

  if (existing) {
    existing.items.push(...items)
    existing.updatedAt = now()
    return existing
  }

  const order: Order = {
    id: generateId(),
    tableId,
    items,
    status: OrderStatus.OPEN,
    createdAt: now(),
    updatedAt: now(),
  }

  orders.set(order.id, order)
  return order
}

export function submitOrder(orderId: OrderId): Order {
  const order = requireOrder(orderId)
  transitionOrder(order, OrderStatus.SUBMITTED)
  order.updatedAt = now()
  return order
}

export function markStationReady(
  orderId: OrderId,
  station: Station
): Order {
  const order = requireOrder(orderId)

  for (const item of order.items) {
    if (item.station === station) {
      ;(item as any).ready = true
    }
  }

  const allReady = order.items.every(
    (i: any) => i.ready === true
  )

  if (allReady) {
    transitionOrder(order, OrderStatus.READY)
  }

  order.updatedAt = now()
  return order
}

export function deliverOrder(orderId: OrderId): Order {
  const order = requireOrder(orderId)
  transitionOrder(order, OrderStatus.DELIVERED)
  transitionOrder(order, OrderStatus.CLOSED)
  order.updatedAt = now()
  return order
}

export function getKitchenQueue(): Order[] {
  return [...orders.values()].filter(
    (o) =>
      o.status === OrderStatus.SUBMITTED ||
      o.status === OrderStatus.READY
  )
}

export function getBarQueue(): Order[] {
  return getKitchenQueue()
}

export function requireOrder(orderId: OrderId): Order {
  const order = orders.get(orderId)
  if (!order) {
    throw new Error("Order not found")
  }
  return order
}
