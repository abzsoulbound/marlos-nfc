import type { SerializedCart } from "@/lib/cart.types";

export type OrderStatus = "pending" | "completed";

export interface Order {
  id: string;
  tableId: string;
  createdAt: string;
  status: OrderStatus;
  cart: SerializedCart;
  routing: {
    kitchen?: boolean;
    bar?: boolean;
  };
  notes: string;
}
