// printer.map.ts
// Map fulfilment areas to physical printers.

import type { Printer } from "./printer.types";
import type { FulfilmentArea } from "./fulfilment.types";

export const PRINTER_BY_AREA: Record<FulfilmentArea, Printer> = {
  kitchen: "kitchen-main",
  bar: "bar-main",
};
