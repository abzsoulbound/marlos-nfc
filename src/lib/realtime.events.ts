import type { Order } from "./order.types";
import type { Session } from "./session.types";
import type { RealtimeEvent } from "./realtime.types";

export function orderCreated(order: Order): RealtimeEvent<Order> {
  return {
    type: "order_created",
    channel: order.routing.kitchen ? "kitchen" : "bar",
    payload: order,
    timestamp: new Date().toISOString(),
  };
}

export function sessionClosed(session: Session): RealtimeEvent<Session> {
  return {
    type: "session_closed",
    channel: "admin",
    payload: session,
    timestamp: new Date().toISOString(),
  };
}
