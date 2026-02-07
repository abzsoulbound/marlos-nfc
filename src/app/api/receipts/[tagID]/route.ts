import { NextResponse } from "next/server";
import { getBill } from "@/lib/ops";
import { buildReceipt } from "@/lib/receipt.build";
import type { ReceiptType } from "@/lib/receipt.types";

export async function GET(
  _req: Request,
  { params }: { params: { tagID: string } }
) {
  const tagId = params.tagID;

  const bill = getBill(tagId);
  if (!bill) {
    return NextResponse.json(
      { error: "No active session for tag" },
      { status: 404 }
    );
  }

  // Domain decision: this endpoint serves the customer receipt
  const receiptType: ReceiptType = "customer";

  const receipt = buildReceipt(bill, receiptType);

  return NextResponse.json(receipt);
}
