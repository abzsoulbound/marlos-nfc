export const runtime = "edge";

import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/store";
import { transition } from "@/lib/stateMachine";
import { logEvent } from "@/lib/audit";
import type { Order } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    await updateOrder(orderId, (o: Order) => {
      if (!o.table) {
        throw new Error("Cannot accept without table");
      }

      const next = transition(o, "accepted");
      logEvent(orderId, "accept");
      return next;
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    );
  }
}
