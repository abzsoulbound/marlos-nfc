import { NextResponse } from "next/server";
import { markStationReady } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId ?? "");
    const station = body?.station === "BAR" ? "BAR" : "KITCHEN";
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
    const order = markStationReady(orderId, station);
    return NextResponse.json({ order });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
