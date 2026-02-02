import { NextResponse } from "next/server"
import { createOrAppendOrder } from "@/lib/orders"
import { OrderItem } from "@/lib/domain"

export async function POST(req: Request) {
  const body = await req.json()
  const { tableId, items } = body as {
    tableId: string
    items: OrderItem[]
  }

  if (!tableId || !items?.length) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    )
  }

  const order = createOrAppendOrder(tableId, items)
  return NextResponse.json(order)
}
