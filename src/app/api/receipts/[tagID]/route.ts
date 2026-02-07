import { NextResponse } from "next/server";
import { buildReceipt } from "@/lib/receipt.build";
import type { ReceiptType } from "@/lib/receipt.types";
import { getLatestOrderForTag } from "@/lib/order.history";

export async function GET(
  _req: Request,
  { params }: { params: { tagId: string } }
) {
  const order = getLatestOrderForTag(params.tagId);

  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  const receiptType: ReceiptType = "customer";
  const receipt = buildReceipt(order, receiptType);

  return NextResponse.json(receipt);
}
