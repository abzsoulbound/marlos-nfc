// bills.ts
// Bill read + staff settlement.

import { billStore } from "../lib/store.repo";
import { markBillAsPaid } from "../lib/staff.actions";
import type { Bill } from "../lib/bill.types";

export function getBill(orderId: string): Bill | null {
  return billStore.get(orderId);
}

export function settleBillApi(orderId: string) {
  return markBillAsPaid(orderId);
}
