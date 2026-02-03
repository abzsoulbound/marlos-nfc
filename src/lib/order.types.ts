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
  quantity: number;
  price: number;
  category?: "DRINK" | "FOOD";
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
  createdAt: number;
  updatedAt?: number;
  status: OrderStatus;
  cart: SerializedCart;
  routing: OrderRouting;
  notes: string;
};
