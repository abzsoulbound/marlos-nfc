import { NextResponse } from "next/server";
import { openSessionByTag } from "@/lib/session.close";
import { buildOrder } from "@/lib/order.serialize";
import type { SerializedCart } from "@/lib/cart.types";

export async function POST(req: Request) {
  const body = await req.json();

  const { tagId, cart, notes } = body as {
    tagId: string;
    cart: SerializedCart;
    notes?: string;
  };

  if (!tagId || !cart || cart.items.length === 0) {
    return NextResponse.json(
      { error: "Invalid order payload" },
      { status: 400 }
    );
  }

  const session = await openSessionByTag(tagId);

  if (!session) {
    return NextResponse.json(
      { error: "No open session for tag" },
      { status: 404 }
    );
  }

  const order = await buildOrder({
    id: crypto.randomUUID(),
    tableId: session.tableId,
    cart,
    notes,
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
