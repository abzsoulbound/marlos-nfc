import type { FulfillmentArea } from "@/lib/fulfilment.types";

export function getFulfillmentArea(itemId: string): FulfillmentArea {
  return itemId.startsWith("drink") ? "bar" : "kitchen";
}
