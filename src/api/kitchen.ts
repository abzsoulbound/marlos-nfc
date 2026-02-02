// kitchen.ts
// Kitchen feed endpoint.

import { getLiveKitchenOrders } from "../lib/kitchen.feed";
import type { KitchenOrder } from "../lib/kitchen.types";

export function getKitchenFeed(): KitchenOrder[] {
  return getLiveKitchenOrders();
}
