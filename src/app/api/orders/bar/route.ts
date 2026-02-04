import { NextResponse } from "next/server"
import { getBarQueue } from "@/lib/orders"

export async function GET() {
  return NextResponse.json(getBarQueue())
}
