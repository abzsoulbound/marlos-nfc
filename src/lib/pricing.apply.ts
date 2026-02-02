// pricing.apply.ts
// Apply pricing rules deterministically.

import type { PricingRule } from "./pricing.types";
import { applyPricingRule } from "./pricing.utils";

export interface PricingResult {
  subtotal: number;
  adjustments: {
    id: string;
    label: string;
    amount: number;
  }[];
  total: number;
}

export function applyPricing(
  subtotal: number,
  rules: PricingRule[]
): PricingResult {
  const adjustments = rules.map(rule => {
    const amount = applyPricingRule(subtotal, rule);
    return {
      id: rule.id,
      label: rule.label,
      amount,
    };
  });

  const totalAdjustments = adjustments.reduce(
    (sum, a) => sum + a.amount,
    0
  );

  return {
    subtotal,
    adjustments,
    total: subtotal + totalAdjustments,
  };
}
