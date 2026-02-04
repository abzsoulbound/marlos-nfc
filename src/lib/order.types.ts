import type { SerializedCart } from "@/lib/cart.types";

export type OrderStatus = "pending" | "completed";

export interface OrderRouting {
  kitchen: boolean;
  bar: boolean;
}

export interface Order {
  id: string;
  tableId: string;
  createdAt: string;
  status: OrderStatus;
  cart: SerializedCart;
  routing: OrderRouting;
  notes: string;
}
