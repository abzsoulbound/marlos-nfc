import { billStore } from "./store.repo";

export function markBillAsPaid(billId: string) {
  const bill = billStore.get(billId);
  if (!bill) {
    throw new Error("Bill not found");
  }
  if (bill.status === "paid") {
    return bill;
  }
  const updated = {
    ...bill,
    status: "paid",
    paidAt: new Date().toISOString(),
  };
  billStore.set(billId, updated);
  return updated;
}
