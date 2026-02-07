import type { Order } from "./order.types";
import type { Receipt, ReceiptType } from "./receipt.types";

export function buildReceipt(
  order: Order,
  type: ReceiptType
): Receipt {
  const lines = order.cart.items.map(item => ({
  text: `${item.quantity}× ${item.name}`
}));

  return {
  type,
  orderId: order.id,
  lines,
};
}
