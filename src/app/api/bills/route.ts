// src/app/api/orders/route.ts

import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders.model";

export async function POST(req: Request) {
  const body = await req.json();

  const order = createOrder({
    table: body.table,
    items: body.items, // [{ itemId, name, price, quantity }]
    notes: body.notes ?? "",
  });

  return NextResponse.json({ orderId: order.orderId });
}
