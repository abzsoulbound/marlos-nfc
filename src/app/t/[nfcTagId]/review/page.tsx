"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Receipt } from "@/lib/receipt.types";

export default function ReviewPage() {
  const params = useParams();
  const tagId =
    typeof params?.nfcTagId === "string" ? params.nfcTagId : "";

  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (!tagId) return;

    fetch(`/api/receipts/${tagId}`)
      .then((res) => res.json())
      .then(setReceipt);
  }, [tagId]);

  if (!receipt) {
    return <main />;
  }

  return (
    <main>
      <h1>Review order</h1>

      <ul>
        {receipt.lines.map((line, i) => (
          <li key={i}>{line.text}</li>
        ))}
      </ul>
    </main>
  );
}
