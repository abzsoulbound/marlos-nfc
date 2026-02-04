// src/app/api/sessions/route.ts

import { NextResponse } from "next/server";
import {
  openSession,
  closeSession,
  listActiveSessions,
} from "@/lib/sessions.store";

export async function GET() {
  return NextResponse.json({
    sessions: listActiveSessions(),
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.action === "open") {
    openSession(body.table);
  }

  if (body.action === "close") {
    closeSession(body.table);
  }

  return NextResponse.json({ ok: true });
}
