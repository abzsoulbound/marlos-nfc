// src/lib/staff.actions.ts

import type { Bill } from "./bill.types";
import { billStore } from "./store.repo";

export async function markBillAsPaid(billId: string): Promise<Bill> {
  const existing = billStore.get(billId);

  if (!existing) {
    throw new Error("Bill not found");
  }

  const updated: Bill = {
    ...existing,
    status: "paid",
    paidAt: new Date().toISOString(),
  };

  billStore.set(billId, updated);
  return updated;
}
