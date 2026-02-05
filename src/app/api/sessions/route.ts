import { NextResponse } from "next/server";
import { listOpenSessions, openOrResumeSession, closeTab } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // staff-only listing
  try {
    requireStaff(req);
    return NextResponse.json({ sessions: listOpenSessions() });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // customer open/resume
  if (body?.action === "open" && typeof body?.tagId === "string") {
    const session = openOrResumeSession(body.tagId);
    return NextResponse.json({ session });
  }

  // staff close tab
  if (body?.action === "closeTab") {
    try {
      requireStaff(req);
      const tagId = String(body?.tagId ?? "");
      if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
      const result = closeTab(tagId);
      return NextResponse.json({ result });
    } catch (e: any) {
      const status = e?.status ?? 401;
      return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
    }
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
