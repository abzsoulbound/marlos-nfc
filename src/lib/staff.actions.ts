// staff.actions.ts
// Explicit staff-triggered actions. External payment assumed.

import { billStore } from "./store.repo";
import type { StaffActionResult } from "./staff.types";
import { settleBill } from "./bill.utils";

export function markBillAsPaid(orderId: string): StaffActionResult {
  const bill = billStore.get(orderId);
  if (!bill) {
    return { ok: false, message: "Bill not found" };
  }

  if (bill.status === "settled") {
    return { ok: false, message: "Bill already settled" };
  }

  const settled = settleBill(bill);
  billStore.set(orderId, settled);

  return { ok: true };
}
