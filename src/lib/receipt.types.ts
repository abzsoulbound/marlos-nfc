export type ReceiptType = "customer" | "kitchen" | "bar";

export type ReceiptLine = {
  text: string;
};

export type Receipt = {
  type: ReceiptType;
  orderId: string;
  lines: ReceiptLine[];
  total?: number;
};
