import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tagId = String(body?.tagId ?? "");
  const items = Array.isArray(body?.items) ? body.items : [];
  const notes = typeof body?.notes === "string" ? body.notes : "";

  if (!tagId || items.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = submitOrder({
    tagId,
    notes,
    items: items.map((i: any) => ({
      id: String(i.id),
      name: String(i.name),
      price: Number(i.price),
      quantity: Number(i.quantity),
      station: i.station === "BAR" ? "BAR" : "KITCHEN",
    })),
  });

  return NextResponse.json({ order });
}
