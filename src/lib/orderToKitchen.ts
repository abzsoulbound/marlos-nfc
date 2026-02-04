import type { KitchenOrder, KitchenItem } from "./kitchen.types";
import type { MenuItem } from "./menu";

export function mapOrderToKitchenOrder(params: {
  orderId: string;
  table: string;
  items: Array<{
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
  }>;
}): KitchenOrder {
  const items: KitchenItem[] = params.items.map((i) => ({
    itemId: i.menuItem.id,
    name: i.menuItem.name,
    quantity: i.quantity,
    notes: i.notes ?? "",
    status: "pending",
  }));

  return {
    orderId: params.orderId,
    table: params.table,
    createdAt: new Date().toISOString(),
    items,
  };
}
