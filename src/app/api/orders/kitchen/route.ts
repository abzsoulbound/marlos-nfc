import { NextResponse } from "next/server"
import { getKitchenQueue } from "@/lib/orders"

export async function GET() {
  return NextResponse.json(getKitchenQueue())
}
