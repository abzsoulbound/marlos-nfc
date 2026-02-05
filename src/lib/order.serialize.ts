import type { Cart } from "./cart.types";
import type { Order } from "./order.types";
import { serializeCart } from "./cart.serialize";
import { deriveRouting } from "./order.utils";

export function buildOrder(params: {
  notes?: string;
  id: string;
  tableId: string;
  cart: Cart;
  notes?: string;
}): Order {
  const now = new Date().toISOString();

  return {
    id: params.id,
    tableId: params.tableId,
    createdAt: now,
    status: "pending",
    cart: serializeCart(params.cart),
    routing: deriveRouting(params.cart),
    notes: params.notes ?? "",
  };
}
