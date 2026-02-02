// variants.ts
// Canonical variant group definitions.
// These IDs are stable and must never change once orders exist.
// Variant groups describe mutually-related menu items (sizes, formats, extras),
// NOT UI behaviour.

/**
 * Variant group IDs
 * - Used by MenuItem.variantGroupId
 * - Enforces type safety across menu + orders
 */
export const VARIANTS = {
  // ─────────────────────────────────────────
  // Coffee
  // ─────────────────────────────────────────
  espresso: "coffee-espresso",
  macchiato: "coffee-macchiato",

  // ─────────────────────────────────────────
  // Wines (glass / bottle variants)
  // ─────────────────────────────────────────
  pinotGrigio: "wine-pinot-grigio",
  sauvignonBlanc: "wine-sauvignon-blanc",
  merlot: "wine-merlot",
  malbec: "wine-malbec",
  pinotBlush: "wine-pinot-blush",
  prosecco: "wine-prosecco",

  // ─────────────────────────────────────────
  // Water (size variants)
  // ─────────────────────────────────────────
  stillWater: "water-still",
  sparklingWater: "water-sparkling",

  // ─────────────────────────────────────────
  // Pancakes (flavour variants)
  // ─────────────────────────────────────────
  buttermilkPancakes: "pancakes-buttermilk",

  // ─────────────────────────────────────────
  // Milkshakes (flavour variants)
  // ─────────────────────────────────────────
  milkshakes: "milkshakes-classic",

  // ─────────────────────────────────────────
  // Extras / add-ons
  // ─────────────────────────────────────────
  altMilk: "extras-alt-milk",
  hotChocolateExtras: "extras-hot-choc",
  gingerExtra: "extras-ginger",
} as const;

/**
 * Union of all valid variant group IDs.
 * This is the ONLY allowed type for MenuItem.variantGroupId.
 */
export type VariantGroupId =
  typeof VARIANTS[keyof typeof VARIANTS];
