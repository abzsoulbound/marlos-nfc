export interface BillLine {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  tableId: string;
  createdAt: string;
  paidAt?: string;
  status: "pending" | "paid";
  lines: BillLine[];
  total: number;
}
