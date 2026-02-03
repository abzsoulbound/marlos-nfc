import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

type InputItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export async function createOrder(params: { table: string; items: InputItem[] }) {
  const { table, items } = params;

  return db.order.create({
    data: {
      table,
      status: OrderStatus.PENDING_ASSIGNMENT,
      items: {
        create: items.map((i) => ({
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

export async function getKitchenQueue() {
  return db.order.findMany({
    where: { status: OrderStatus.ACCEPTED },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBarQueue() {
  return db.order.findMany({
    where: { status: OrderStatus.ACCEPTED },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
}
