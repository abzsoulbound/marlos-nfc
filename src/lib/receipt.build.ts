import type { Order } from "./order.types";
import type { Receipt, ReceiptType } from "./receipt.types";

export function buildReceipt(
  order: Order,
  type: ReceiptType
): Receipt {
  const lines = order.cart.items.map(item => ({
    text: `${item.quantity}× ${item.name} – £${(item.price * item.quantity).toFixed(2)}`
  }));

  return {
    type,
    orderId: order.id,
    lines,
    total: type === "customer" ? order.cart.totalPrice : undefined,
  };
}
