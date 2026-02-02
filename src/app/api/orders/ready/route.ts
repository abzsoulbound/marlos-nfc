import { NextResponse } from "next/server"
import { markStationReady } from "@/lib/orders"
import { Station } from "@/lib/domain"

export async function POST(req: Request) {
  const { orderId, station } = await req.json()

  if (!orderId || !station) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    )
  }

  const order = markStationReady(orderId, station as Station)
  return NextResponse.json(order)
}
