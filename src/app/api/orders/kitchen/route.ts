export const runtime = "edge";

import { NextResponse } from "next/server"
import { getKitchenQueue } from "@/lib/orders"

export async function GET() {
  const orders = await getKitchenQueue()
  return NextResponse.json(orders)
}
