import { NextResponse } from "next/server"
import { getActiveOrders } from "@/lib/orders"

export async function GET() {
  return NextResponse.json({
    orders: getActiveOrders()
  })
}
