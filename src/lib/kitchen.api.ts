import { db } from "@/lib/db";

export async function fetchKitchenQueue() {
  const orders = await db.order.findMany({
    where: { status: "ACCEPTED" },
    orderBy: { createdAt: "asc" },
  });
  return { orders };
}
