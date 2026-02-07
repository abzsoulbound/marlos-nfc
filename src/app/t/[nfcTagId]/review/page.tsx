"use client";

import { useEffect, useState } from "react";
import type { Receipt } from "@/lib/receipt.types";

type Params = {
  nfcTagId: string;
};

export default function ReviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    params.then(({ nfcTagId }) => {
      fetch(`/api/receipts/${nfcTagId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) {
            setReceipt(data);
            setLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading || !receipt) return <main />;

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
