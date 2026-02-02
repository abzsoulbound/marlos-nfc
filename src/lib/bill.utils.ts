// bill.utils.ts
// Staff-side actions only.

import type { Bill } from "./bill.types";

export function settleBill(bill: Bill): Bill {
  return {
    ...bill,
    status: "settled",
    settledAt: new Date().toISOString(),
  };
}
