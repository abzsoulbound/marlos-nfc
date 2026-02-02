import { Order, OrderStatus } from "./domain"

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.OPEN]: [OrderStatus.SUBMITTED],
  [OrderStatus.SUBMITTED]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.CLOSED],
  [OrderStatus.CLOSED]: [],
}

export function transitionOrder(
  order: Order,
  nextStatus: OrderStatus
): Order {
  const allowedNext = ALLOWED_TRANSITIONS[order.status]

  if (!allowedNext.includes(nextStatus)) {
    throw new Error(
      `Invalid order state transition: ${order.status} → ${nextStatus}`
    )
  }

  return {
    ...order,
    status: nextStatus,
    updatedAt: Date.now(),
  }
}
