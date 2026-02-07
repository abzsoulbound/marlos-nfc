export type FulfilmentArea = "kitchen" | "bar";

export interface FulfilmentRule {
  itemId: string;
  area: FulfilmentArea;
}
