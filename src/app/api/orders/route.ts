import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Back-compat accepted shapes:
  // 1) { tagId, items, notes }
  // 2) { tableId, items }  (older)
  const tagId = String(body?.tagId ?? body?.tableId ?? "");
  const items = Array.isArray(body?.items) ? body.items : [];
  const notes = typeof body?.notes === "string" ? body.notes : "";

  if (!tagId || items.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = submitOrder({
    tagId,
    notes,
    items: items.map((i: any) => ({
      id: String(i.id ?? i.itemId ?? i.variantId ?? crypto.randomUUID()),
      name: String(i.name),
      price: Number(i.price ?? 0),
      quantity: Number(i.quantity ?? 1),
      station: (i.station === "BAR" ? "BAR" : "KITCHEN"),
    })),
  });

  return NextResponse.json({ order });
}
