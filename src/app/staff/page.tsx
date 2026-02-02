// src/app/staff/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function StaffPage() {
  const [bill, setBill] = useState<any>(null);

  useEffect(() => {
    fetch("/api/bills?table=12")
      .then(r => r.json())
      .then(setBill);
  }, []);

  if (!bill) return null;

  return (
    <main>
      <h1>Bill — Table {bill.table}</h1>

      {bill.items.map((i: any, idx: number) => (
        <div key={idx}>
          {i.name} — £{i.price.toFixed(2)}
        </div>
      ))}

      <strong>Total: £{bill.total.toFixed(2)}</strong>
    </main>
  );
}
