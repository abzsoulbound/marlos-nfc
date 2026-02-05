import { NextResponse } from "next/server";
import { getBill, closeTab } from "@/lib/ops";
import { requireStaff } from "@/lib/staffAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tagId = url.searchParams.get("tagId") || url.searchParams.get("table") || "";
  if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
  const bill = getBill(tagId);
  return NextResponse.json(bill);
}

export async function POST(req: Request) {
  try {
    requireStaff(req);
    const body = await req.json().catch(() => ({}));
    const tagId = String(body?.tagId ?? "");
    if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
    const result = closeTab(tagId);
    return NextResponse.json({ result });
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message ?? "unauthorized" }, { status });
  }
}
