import type { FulfilmentArea } from "@/lib/fulfilment.types";

export function getFulfilmentArea(itemId: string): FulfilmentArea {
  return itemId.startsWith("drink") ? "bar" : "kitchen";
}
