"use client";

import { useEffect, useState } from "react";

type PageProps = { params: { nfcTagId: string } };

export default function ReviewPage({ params }: PageProps) {
  const tagId = params.nfcTagId;
  const [bill, setBill] = useState<any>(null);

  useEffect(() => {
    fetch("/api/bills?tagId=" + encodeURIComponent(tagId), { cache: "no-store" })
      .then(r => r.json())
      .then(setBill)
      .catch(() => setBill({ error: "failed" }));
  }, [tagId]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Current tab</h1>
      <p style={{ opacity: 0.8 }}>Tag: {tagId}</p>

      {!bill && <p>Loading…</p>}
      {bill?.error && <p style={{ color: "red" }}>Error</p>}

      {bill?.lines && (
        <>
          {bill.tableNumber && <p><strong>Table {bill.tableNumber}</strong></p>}
          {bill.lines.map((l: any, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "6px 0" }}>
              <span>{l.name} × {l.qty}</span>
              <span>£{l.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <p style={{ marginTop: 12 }}><strong>Total: £{bill.total.toFixed(2)}</strong></p>
        </>
      )}
    </main>
  );
}
