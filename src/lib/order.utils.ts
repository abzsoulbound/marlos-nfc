import type { Cart } from "./cart.types";
import type { OrderRouting } from "./order.types";
import { getFulfillmentArea } from "./fulfillment.utils";

export function deriveRouting(cart: Cart): OrderRouting {
  const kitchen = [];
  const bar = [];

  for (const item of Object.values(cart.items)) {
    const area = getFulfillmentArea(item.itemId);
    if (area === "kitchen") kitchen.push(item);
    if (area === "bar") bar.push(item);
  }

  return { kitchen, bar };
}
