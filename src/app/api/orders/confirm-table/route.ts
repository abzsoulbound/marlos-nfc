export const runtime = "edge";

import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server"
import { closeSession } from "@/lib/tableSessions"
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { table } = await req.json()

  await db.order.updateMany({
    where: {
      table,
      status: OrderStatus.READY,
    },
    data: {
      status: OrderStatus.DELIVERED,
    },
  })

  await closeSession(table)

  return NextResponse.json({ ok: true })
}
