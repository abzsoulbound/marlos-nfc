import { FULFILMENT_MAP } from "./fulfilment.map";
import type { FulfillmentArea } from "./fulfilment.types";

export function getFulfillmentArea(itemId: string): FulfillmentArea {
  return FULFILMENT_MAP.find(r => r.itemId === itemId)?.area ?? "kitchen";
}
