export const runtime = "edge";

import { NextResponse } from "next/server"
import { getBarQueue } from "@/lib/orders"

export async function GET() {
  const orders = await getBarQueue()
  return NextResponse.json(orders)
}
