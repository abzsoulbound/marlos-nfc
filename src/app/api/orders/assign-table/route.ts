export const runtime = "edge";

import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/store";
import { transition } from "@/lib/stateMachine";
import { logEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { orderId, table } = await req.json();



updateOrder(orderId, (o) => {
  if (o.table !== null) {
    throw new Error("Table already assigned");
  }

  const next = transition(o, "pending_assignment");
  const updated = { ...next, table };

  logEvent(orderId, "assign_table", { table });

  return updated;
});

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    );
  }
}
