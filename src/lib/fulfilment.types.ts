export type FulfillmentArea = "kitchen" | "bar";

export type FulfilmentRule = {
  itemId: string;
  area: FulfillmentArea;
};
