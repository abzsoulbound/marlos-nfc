import { NextResponse } from "next/server";
import { getOrderForTag } from "@/lib/orders";
import { buildReceipt } from "@/lib/receipt.build";
import type { ReceiptType } from "@/lib/receipt.types";

export async function GET(
  _req: Request,
  { params }: { params: { tagId: string } }
) {
  const order = getOrderForTag(params.tagId);

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
