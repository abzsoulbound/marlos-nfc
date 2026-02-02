// variant.utils.ts
// Helpers for resolving variants at runtime.

import type { VariantGroup } from "./variant.types";
import { VARIANT_GROUPS } from "./variant.map";

export function getVariantGroup(
  groupId?: string
): VariantGroup | null {
  if (!groupId) return null;
  return VARIANT_GROUPS.find(v => v.id === groupId) ?? null;
}

export function calculateVariantPrice(
  basePrice: number,
  deltas: number[]
): number {
  return deltas.reduce((sum, d) => sum + d, basePrice);
}
