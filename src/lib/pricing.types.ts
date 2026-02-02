// pricing.types.ts
// Generic pricing adjustments applied to carts or orders.

export type PricingType =
  | "discount"
  | "service_charge";

export interface PricingRule {
  id: string;
  type: PricingType;
  label: string;

  // percentage OR flat amount
  percentage?: number; // e.g. 10 = 10%
  amount?: number;     // flat GBP

  appliesTo: "cart";   // future-proofing
}
