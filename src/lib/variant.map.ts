// variant.map.ts
// Centralised variant definitions.
// IDs are stable and referenced from menu.tsx only.

import type { VariantGroup } from "./variant.types";

export const VARIANT_GROUPS: VariantGroup[] = [
  {
    id: "coffee-espresso",
    title: "Espresso Size",
    required: true,
    options: [
      { id: "single", label: "Single", priceDelta: 0 },
      { id: "double", label: "Double", priceDelta: 0.6 },
    ],
  },

  {
    id: "coffee-macchiato",
    title: "Macchiato Size",
    required: true,
    options: [
      { id: "single", label: "Single", priceDelta: 0 },
      { id: "double", label: "Double", priceDelta: 0.5 },
    ],
  },

  {
    id: "wine-glass-bottle",
    title: "Wine Size",
    required: true,
    options: [
      { id: "small", label: "Small", priceDelta: 0 },
      { id: "large", label: "Large", priceDelta: 1.0 },
      { id: "bottle", label: "Bottle", priceDelta: 16.0 },
    ],
  },

  {
    id: "water-size",
    title: "Water",
    required: true,
    options: [
      { id: "330ml", label: "330ml", priceDelta: 0 },
      { id: "750ml", label: "750ml", priceDelta: 2.0 },
    ],
  },

  {
    id: "pancake-type",
    title: "Pancake Type",
    required: true,
    options: [
      { id: "lemon-sugar", label: "Lemon & Sugar", priceDelta: 0 },
      { id: "nutella-banana", label: "Nutella & Banana", priceDelta: 2.0 },
      { id: "berries-maple", label: "Berries & Maple", priceDelta: 4.0 },
      { id: "bacon-egg", label: "Bacon & Egg", priceDelta: 3.0 },
    ],
  },

  {
    id: "milkshake-flavour",
    title: "Milkshake Flavour",
    required: true,
    options: [
      { id: "vanilla", label: "Vanilla", priceDelta: 0 },
      { id: "banana", label: "Banana", priceDelta: 0 },
      { id: "strawberry", label: "Strawberry", priceDelta: 0 },
      { id: "chocolate", label: "Chocolate", priceDelta: 0 },
      { id: "oreo", label: "Oreo", priceDelta: 0 },
      { id: "kinder", label: "Kinder Bueno", priceDelta: 0 },
      { id: "ferrero", label: "Ferrero Rocher", priceDelta: 0 },
    ],
  },

  {
    id: "extras-alt-milk",
    title: "Milk Options",
    required: false,
    options: [
      { id: "soya", label: "Soya", priceDelta: 0.3 },
      { id: "oat", label: "Oat", priceDelta: 0.3 },
      { id: "coconut", label: "Coconut", priceDelta: 0.3 },
      { id: "almond", label: "Almond", priceDelta: 0.3 },
    ],
  },

  {
    id: "extras-hot-choc",
    title: "Extras",
    required: false,
    options: [
      { id: "marshmallows", label: "Marshmallows", priceDelta: 0.5 },
      { id: "whipped-cream", label: "Whipped Cream", priceDelta: 0.5 },
    ],
  },

  {
    id: "extras-ginger",
    title: "Extras",
    required: false,
    options: [
      { id: "ginger", label: "Fresh Ginger", priceDelta: 0.5 },
    ],
  },
];
