export const runtime = "edge";

import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/store";
import { transition } from "@/lib/stateMachine";
import { logEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    await updateOrder(orderId, (o) => {
      // With your current Order shape, items live in o.cart.items.
      // Your DB adapter also does NOT persist per-item delivered flags.
      // So this endpoint marks the whole order as delivered using the state machine.
      const next = transition(o, "delivered");
      logEvent(orderId, "deliver_item");
      return next;
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Bad request" }, { status: 400 });
  }
}
