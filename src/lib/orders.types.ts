export type OrderStatus = "pending" | "open" | "completed";

export type OrderRouting = {
  kitchen: boolean;
  bar: boolean;
};

export type Order = {
  id: string;
  tableId: string;
  createdAt: string;
  status: OrderStatus;
  cart: {
    items: {
      itemId: string;
      name: string;
      quantity: number;
      price: number;
      lineTotal: number;
      notes?: string;
    }[];
    total: number;
  };
  routing: OrderRouting;
  notes: string;
};
