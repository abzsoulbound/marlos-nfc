import { orderStore } from "./store.repo";
import type { KitchenOrder } from "./kitchen.types";

export function getLiveKitchenOrders(): KitchenOrder[] {
  return orderStore
    .getAll()
    .filter((o: any) => o.status === "pending" && o.routing?.kitchen)
    .map((o: any) => ({
      orderId: o.id,
      tableId: o.tableId,
      createdAt: o.createdAt,
      items: o.cart.items.map((i: { itemId: string; name: string; quantity: number }) => ({
        itemId: i.itemId,
        name: i.name,
        quantity: i.quantity,
      })),
    }));
}
