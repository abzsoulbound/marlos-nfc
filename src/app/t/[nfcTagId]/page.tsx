import { use, useEffect, useState } from "react";
import type { Bill } from "@/lib/bill.types";
import type { Receipt } from "@/lib/receipt.types";

type Params = {
  nfcTagId: string;
};

export default function ReviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { nfcTagId } = use(params);

  const [bill, setBill] = useState<Bill | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`/api/bills?tagId=${nfcTagId}`).then(r => r.json()),
      fetch(`/api/receipts?tagId=${nfcTagId}`).then(r => r.json()),
    ]).then(([billData, receiptData]) => {
      if (cancelled) return;
      setBill(billData);
      setReceipt(receiptData);
    });

    return () => {
      cancelled = true;
    };
  }, [nfcTagId]);

  if (!bill || !receipt) {
    return <main />;
  }

  return (
    <main>
      <h1>Review order</h1>

      <ul>
        {receipt.items.map(line => (
          <li key={line.itemId}>
            <strong>{line.name}</strong> × {line.quantity}
          </li>
        ))}
      </ul>

      <div>
        <p>Total: £{bill.total.toFixed(2)}</p>
      </div>
    </main>
  );
}
