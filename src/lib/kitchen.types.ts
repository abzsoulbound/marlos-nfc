export type KitchenItemStatus = "pending" | "delivered";

export type KitchenItem = {
  itemId: string;
  name: string;
  quantity: number;
  notes: string;
  status: KitchenItemStatus;
};

export type KitchenOrder = {
  orderId: string;
  table: string;
  createdAt: string;
  items: KitchenItem[];
};
