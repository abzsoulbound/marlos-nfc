/**
 * Compatibility wrapper.
 * Older code called createOrder/getOrders from this module.
 * Keep it, but route to the persistent ops store to avoid split-brain state.
 */
import { getBill, submitOrder } from "./ops";

type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  station?: "KITCHEN" | "BAR";
};

export function createOrder(input: { table: string; items: OrderItem[]; notes: string }) {
  // table is treated as tagId for back-compat in this repo snapshot
  return submitOrder({
    tagId: input.table,
    notes: input.notes,
    items: input.items.map(i => ({
      id: String(i.itemId),
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      station: (i.station === "BAR" ? "BAR" : "KITCHEN"),
    })),
  });
}

export function getOrders() {
  // Back-compat: return a bill-like view (orders list was never stable here)
  return getBill("unknown");
}
