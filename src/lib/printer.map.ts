// printer.map.ts
// Map fulfilment areas to physical printers.

import type { Printer } from "./printer.types";
import type { FulfillmentArea } from "./fulfilment.types";

export const PRINTER_BY_AREA: Record<FulfillmentArea, Printer> = {
  kitchen: "kitchen-main",
  bar: "bar-main",
};
