// receipt.format.ts
// Convert receipt into printable text (plain / ESC-POS later).

import type { Receipt } from "./receipt.types";

export function formatReceipt(receipt: Receipt): string {
  const body = receipt.lines.map(l => l.text).join("\n");

  if (receipt.total == null) {
    return body;
  }

  return `${body}\n\nTOTAL: £${receipt.total.toFixed(2)}`;
}
