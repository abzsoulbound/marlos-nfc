import { NextResponse } from "next/server";
import { listQueue } from "@/lib/ops";

export const runtime = "nodejs";

export async function GET() {
  const orders = listQueue("BAR");
  return NextResponse.json(orders);
}
