export const runtime = "edge";

import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(req: Request) {
  const body = await req.json();

  const order = await createOrder({
    table: body.table ?? body.tableId,
    items: body.items,
  });

  return NextResponse.json(order);
}
