// BACKEND CONTRACT — DO NOT BREAK WITHOUT VERSIONING

export type OrderState =
  | "created"
  | "pending_assignment"
  | "accepted"
  | "ready"
  | "delivered"
  | "closed";

export type OrderItem = {
  itemId: string;          // immutable
  name: string;            // display-only
  quantity: number;
  area: "kitchen" | "bar";
  delivered: boolean;
};

export type Order = {
  orderId: string;         // immutable
  nfcTagId: string;        // immutable
  table: number | null;    // mutable until accepted
  state: OrderState;
  items: OrderItem[];
  createdAt: number;
  updatedAt: number;
};
