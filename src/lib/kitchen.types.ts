/**
 * Temporary stub to satisfy Next build.
 * Replace with real kitchen order schema later.
 */
export type KitchenOrderItem = {
  itemId: string;
  name: string;
  quantity: number;
};

export type KitchenOrder = {
  orderId: string;
  table: string;
  createdAt: string;
  items: KitchenOrderItem[];
};
