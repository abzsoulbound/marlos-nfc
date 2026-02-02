// staff.bill.ts
// Read-only bill projection for staff UI.

import type { Bill } from "./bill.types";

export interface StaffBillView {
  orderId: string;
  total: number;
  status: "open" | "settled";
}

export function buildStaffBillView(bill: Bill): StaffBillView {
  return {
    orderId: bill.orderId,
    total: bill.total,
    status: bill.status,
  };
}
