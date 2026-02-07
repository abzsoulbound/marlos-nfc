import type { Cart } from "./cart.types";
import { getFulfilmentArea } from "./fulfilment.utils";

export function deriveRouting(cart: Cart) {
  let kitchen = false;
  let bar = false;

  for (const item of cart.items) {
    const area = getFulfilmentArea(item.itemId);
    if (area === "kitchen") kitchen = true;
    if (area === "bar") bar = true;
  }

  return { kitchen, bar };
}
