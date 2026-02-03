import type { Cart } from "./cart.types";
import type { Order } from "./order.types";
import { serializeCart } from "./cart.serialize";
import { deriveRouting } from "./order.utils";

export function buildOrder(params: {
  id: string;
  table: string;
  cart: Cart;
  notes?: string;
}): Order {
  const now = Date.now();

  return {
    id: params.id,
    table: params.table,
    createdAt: now,
    status: "OPEN",
    cart: serializeCart(params.cart),
    routing: deriveRouting(params.cart),
    notes: params.notes ?? "",
  };
}
