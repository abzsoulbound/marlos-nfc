// pricing.utils.ts
// Pure math. No side effects.

import type { PricingRule } from "./pricing.types";

export function applyPricingRule(
  subtotal: number,
  rule: PricingRule
): number {
  if (rule.percentage != null) {
    return subtotal * (rule.percentage / 100);
  }

  if (rule.amount != null) {
    return rule.amount;
  }

  return 0;
}
