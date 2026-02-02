import type { Cart, SerializedCart } from "@/lib/cart.types";

export function serializeCart(cart: Cart): SerializedCart {
  return structuredClone(cart);
}
