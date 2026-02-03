import { db } from "@/lib/db";
import type { Order, OrderItem } from "@/lib/types";

export async function createOrder(order: Order) {
  return db.order.create({
    data: {
      id: order.id,
      table: order.table,
      status: order.status,
      createdAt: new Date(order.createdAt),
      items: {
        create: order.cart.items.map((i: OrderItem) => ({
          itemId: i.itemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });
}

export async function getOrders(): Promise<Order[]> {
  const rows = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(rowToOrder);
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    table: row.table,
    status: row.status,
    createdAt: row.createdAt.getTime(),
    updatedAt: undefined,
    cart: {
      items: row.items,
      totalItems: row.items.reduce(
        (s: number, i: OrderItem) => s + i.quantity,
        0
      ),
      totalPrice: row.items.reduce(
        (s: number, i: OrderItem) => s + i.price * i.quantity,
        0
      ),
    },
    routing: { kitchen: [], bar: [] },
    notes: "",
  };
}

export async function updateOrder(
  orderId: string,
  updater: (o: Order) => Order
) {
  const row = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!row) throw new Error("Order not found");

  const current = rowToOrder(row);
  const updated = updater(current);

  await db.order.update({
    where: { id: orderId },
    data: {
      table: updated.table,
      status: updated.status,    },
  });
}
