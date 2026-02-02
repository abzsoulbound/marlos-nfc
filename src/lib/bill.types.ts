// bill.types.ts
// Final amount presented to staff/customer.

export type BillStatus =
  | "open"
  | "settled";

export interface BillLine {
  label: string;
  amount: number;
}

export interface Bill {
  orderId: string;
  subtotal: number;
  adjustments: BillLine[];
  total: number;
  status: BillStatus;
  createdAt: string;
  settledAt?: string;
}
