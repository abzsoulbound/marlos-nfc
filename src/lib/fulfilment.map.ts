// fulfilment.map.ts
// Explicit routing map for items.
// Defaults should be assumed kitchen unless listed here.

import type { FulfilmentRule } from "./fulfilment.types";

export const FULFILMENT_MAP: FulfilmentRule[] = [
  // Drinks → Bar
  { itemId: "coke", area: "bar" },
  { itemId: "diet-coke", area: "bar" },
  { itemId: "coke-zero", area: "bar" },
  { itemId: "fanta", area: "bar" },
  { itemId: "sprite", area: "bar" },
  { itemId: "red-bull", area: "bar" },

  { itemId: "espresso-single", area: "bar" },
  { itemId: "espresso-double", area: "bar" },
  { itemId: "latte", area: "bar" },
  { itemId: "cappuccino", area: "bar" },
  { itemId: "americano", area: "bar" },
  { itemId: "flat-white", area: "bar" },
  { itemId: "mochaccino", area: "bar" },
  { itemId: "matcha-latte", area: "bar" },
  { itemId: "chai-latte", area: "bar" },
  { itemId: "iced-latte", area: "bar" },
  { itemId: "hot-chocolate", area: "bar" },

  { itemId: "peroni", area: "bar" },
  { itemId: "corona", area: "bar" },
  { itemId: "efes-draft", area: "bar" },
  { itemId: "magners-cider", area: "bar" },

  { itemId: "prosecco-glass", area: "bar" },
  { itemId: "prosecco-bottle", area: "bar" },
  { itemId: "bellini-glass", area: "bar" },
  { itemId: "mimosa-glass", area: "bar" },
  { itemId: "kir-royale-glass", area: "bar" },
];
