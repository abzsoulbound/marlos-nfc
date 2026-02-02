"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { menu } from "@/lib/menu";

type Cart = Record<string, number>;

type ReviewItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  section: string;
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ nfcTagId: string }>();

  const [cart, setCart] = useState<Cart>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("cart");
    if (!raw) {
      router.replace(`/t/${params.nfcTagId}`);
      return;
    }
    setCart(JSON.parse(raw));
  }, [params.nfcTagId, router]);

  const items = useMemo<ReviewItem[]>(() => {
    const out: ReviewItem[] = [];

    for (const section of menu) {
      for (const item of section.items) {
        const qty = cart[item.id];
        if (!qty) continue;

        out.push({
          id: item.id,
          name: item.name,          // ← MENU NAME (correct)
          price: item.price,
          quantity: qty,
          section: section.title,
        });
      }
    }

    return out;
  }, [cart]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <main style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Review Order</h1>

      {items.map((item) => (
        <div
          key={item.id}
          style={{ padding: "12px 0", borderBottom: "1px solid #333" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{item.name}</strong>
            <span>
              £{item.price.toFixed(2)} × {item.quantity}
            </span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>{item.section}</div>
        </div>
      ))}

      <div style={{ marginTop: 16, fontWeight: 700 }}>
        Total: £{total.toFixed(2)}
      </div>

      <button
        style={{ marginTop: 20, padding: 12, width: "100%" }}
        onClick={() => {
          // submit later
          sessionStorage.removeItem("cart");
          router.push(`/t/${params.nfcTagId}`);
        }}
      >
        Confirm Order
      </button>
    </main>
  );
}
