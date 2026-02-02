import { NextResponse } from "next/server"
import { markItemReady } from "@/lib/orders"

export async function POST(req: Request) {
  const { orderId, itemId } = await req.json()

  if (!orderId || !itemId) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  markItemReady(orderId, itemId)

  return NextResponse.json({ ok: true })
}
