import type { Cart } from "./cart.types";

export function serializeCart(cart: Cart) {
  const items = Object.values(cart.items);
  return {
    items,
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}
