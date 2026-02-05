export interface KitchenItem {
  itemId: string;
  name: string;
  quantity: number;
}

export interface KitchenOrder {
  orderId: string;
  tableId: string;
  createdAt: string;
  items: KitchenItem[];
}
