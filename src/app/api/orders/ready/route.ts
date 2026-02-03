export const runtime = "edge";

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireStaff } from "@/lib/staffAuth"
import { StaffRole, OrderStatus } from "@prisma/client"

export async function POST(req: Request) {
  const { orderId, pin } = await req.json()

  await requireStaff(pin, [StaffRole.KITCHEN, StaffRole.BAR])

  await db.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.READY },
  })

  return NextResponse.json({ ok: true })
}
