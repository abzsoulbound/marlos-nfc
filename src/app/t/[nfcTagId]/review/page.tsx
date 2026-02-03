"use client";

export const runtime = "edge";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { menu } from "@/lib/menu";

type Cart = Record<string, number>;

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams() as { nfcTagId?: string };
  const nfcTagId = params?.nfcTagId ?? "";

  const [submitting, setSubmitting] = useState(false);

  const cart: Cart = useMemo(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? (JSON.parse(raw) as Cart) : {};
    } catch {
      return {};
    }
  }, []);

  const lines = useMemo(() => {
    const out: { itemId: string; name: string; quantity: number; price: number; section: string }[] = [];
    for (const section of menu) {
      for (const item of section.items) {
        const q = cart[item.id] ?? 0;
        if (q > 0) out.push({ itemId: item.id, name: item.name, quantity: q, price: item.price, section: section.title });
      }
    }
    return out;
  }, [cart]);

  const total = useMemo(() => lines.reduce((s, l) => s + l.price * l.quantity, 0), [lines]);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nfcTagId,
          items: lines.map(l => ({ itemId: l.itemId, quantity: l.quantity })),
        }),
      });

      if (!res.ok) throw new Error("submit failed");
      const data = await res.json();
      localStorage.removeItem("cart");
      router.push(`/confirm?orderId=${encodeURIComponent(data.orderId ?? "")}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Review order</h1>
      <p style={{ opacity: 0.8 }}>Tag: {nfcTagId}</p>

      {lines.length === 0 ? (
        <p>Your basket is empty.</p>
      ) : (
        <>
          <ul style={{ paddingLeft: 18 }}>
            {lines.map(l => (
              <li key={l.itemId}>
                {l.name} × {l.quantity} — £{(l.price * l.quantity).toFixed(2)}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 16, fontWeight: 700 }}>Total: £{total.toFixed(2)}</div>

          <button
            onClick={submit}
            disabled={submitting}
            style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, border: "1px solid #000", cursor: "pointer" }}
          >
            {submitting ? "Submitting…" : "Confirm order"}
          </button>
        </>
      )}
    </main>
  );
}
