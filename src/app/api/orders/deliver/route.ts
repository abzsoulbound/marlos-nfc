import { NextResponse } from "next/server"
import { deliverOrdersForTable } from "@/lib/orders"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tableId = body?.tableId

    if (!tableId) {
      return NextResponse.json(
        { error: "tableId missing" },
        { status: 400 }
      )
    }

    deliverOrdersForTable(tableId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "unknown error" },
      { status: 500 }
    )
  }
}
