import type { Cart } from "./cart.types";

export function serializeCart(cart: Cart) {
  return {
    items: cart.items.map(i => ({
      itemId: i.itemId,
      name: i.name,
      quantity: i.quantity,
    })),
  };
}
