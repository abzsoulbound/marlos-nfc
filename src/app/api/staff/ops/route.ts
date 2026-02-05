import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staffAuth";
import { setTableAssignment, reassignTag, mergeSessions } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    if (action === "assignTable") {
      const tagId = String(body?.tagId ?? "");
      const tableNumber = String(body?.tableNumber ?? "");
      const confirmed = Boolean(body?.confirmed ?? true);
      if (!tagId || !tableNumber) return NextResponse.json({ error: "tagId/tableNumber required" }, { status: 400 });
      const assignment = setTableAssignment(tagId, tableNumber, confirmed);
      return NextResponse.json({ assignment });
    }

    if (action === "reassignTag") {
      const oldTagId = String(body?.oldTagId ?? "");
      const newTagId = String(body?.newTagId ?? "");
      if (!oldTagId || !newTagId) return NextResponse.json({ error: "oldTagId/newTagId required" }, { status: 400 });
      const result = reassignTag(oldTagId, newTagId);
      return NextResponse.json({ result });
    }

    if (action === "mergeSessions") {
      const fromTagId = String(body?.fromTagId ?? "");
      const intoTagId = String(body?.intoTagId ?? "");
      if (!fromTagId || !intoTagId) return NextResponse.json({ error: "fromTagId/intoTagId required" }, { status: 400 });
      const result = mergeSessions(fromTagId, intoTagId);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
