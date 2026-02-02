// cart.utils.ts
// Pure cart math + helpers.

import type { Cart, CartItem } from "./cart.types";

export function getItemTotal(item: CartItem): number {
  return item.lineTotal;
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce(
    (sum: number, item: CartItem) => sum + item.lineTotal,
    0
  );
}

export function mergeCartItem(
  cart: Cart,
  incoming: CartItem
): Cart {
  const existing = cart.items.find(
    (i: CartItem) =>
      i.itemId === incoming.itemId &&
      (i.notes ?? "") === (incoming.notes ?? "")
  );

  let items: CartItem[];

  if (!existing) {
    items = [...cart.items, incoming];
  } else {
    items = cart.items.map((i: CartItem) =>
      i === existing
        ? {
            ...i,
            quantity: i.quantity + incoming.quantity,
            lineTotal: i.lineTotal + incoming.lineTotal,
          }
        : i
    );
  }

  return {
    items,
    total: items.reduce(
      (sum: number, item: CartItem) => sum + item.lineTotal,
      0
    ),
  };
}
