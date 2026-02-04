import { NextResponse } from "next/server"
import { submitOrder } from "@/lib/orders"

export async function POST(req: Request) {
  const { orderId } = await req.json()

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing orderId" },
      { status: 400 }
    )
  }

  const order = submitOrder(orderId)
  return NextResponse.json(order)
}
