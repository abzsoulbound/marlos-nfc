export type FulfillmentArea = "kitchen" | "bar";

export interface FulfilmentRule {
  itemId: string;
  area: FulfillmentArea;
}
