import { NextResponse } from "next/server";
import { getBill } from "@/lib/ops";
import { buildReceipt } from "@/lib/receipt.build";

export async function GET(
  _req: Request,
  { params }: { params: { tagId: string } }
) {
  const bill = getBill(params.tagId);

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  const receipt = buildReceipt(bill);

  return NextResponse.json(receipt);
}
