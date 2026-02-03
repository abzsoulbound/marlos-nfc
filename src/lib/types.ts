export type OrderStatus =
  | "OPEN"
  | "PENDING_ASSIGNMENT"
  | "ACCEPTED"
  | "READY"
  | "DELIVERED"
  | "CLOSED";

export type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type SerializedCart = {
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
};

export type OrderRouting = {
  kitchen: OrderItem[];
  bar: OrderItem[];
};

export type Order = {
  id: string;
  table: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt?: number;
  cart: SerializedCart;
  routing: OrderRouting;
  notes: string;
};
