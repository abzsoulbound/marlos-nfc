export const runtime = "edge";

import { NextResponse } from "next/server";

import { createOrder, getOrders } from "@/lib/store";
import type { Order, OrderItem } from "@/lib/types";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nfcTagId || !Array.isArray(body.items)) {
      throw new Error("Invalid payload");
    }

    const now = Date.now();

    const items: OrderItem[] = body.items.map((i: any) => ({
      itemId: i.itemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    const order: Order = {
      id: crypto.randomUUID(),
      table: "",                 // MUST be string, never null
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
      cart: {
        items,
        totalItems: items.reduce((s, i) => s + i.quantity, 0),
        totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
      },
      routing: { kitchen: [], bar: [] },
      notes: "",
    };

    await createOrder(order);

    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    );
  }
}
