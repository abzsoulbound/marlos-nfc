import type { Order } from "./order.types";

export type OrderState =
  | "created"
  | "pending_assignment"
  | "accepted"
  | "ready"
  | "delivered"
  | "closed";

export type OrderAction =
  | "assign_table"
  | "accept"
  | "mark_ready"
  | "deliver_item"
  | "close";

const allowedTransitions: Record<OrderState, OrderState[]> = {
  created: ["pending_assignment"],
  pending_assignment: ["accepted"],
  accepted: ["ready"],
  ready: ["delivered"],
  delivered: ["closed"],
  closed: [],
};

export function canTransition(from: OrderState, to: OrderState): boolean {
  return allowedTransitions[from].includes(to);
}

export function transition(order: Order, to: OrderState): Order {
  const from = (order.status as unknown as OrderState) ?? "created";

  if (!canTransition(from, to)) {
    throw new Error(`Illegal transition: ${from} → ${to}`);
  }

  const statusMap: Record<OrderState, Order["status"]> = {
    created: "OPEN",
    pending_assignment: "PENDING_ASSIGNMENT",
    accepted: "ACCEPTED",
    ready: "READY",
    delivered: "DELIVERED",
    closed: "CLOSED",
  };

  return {
    ...order,
    status: statusMap[to],
    updatedAt: Date.now(),
  };
}
