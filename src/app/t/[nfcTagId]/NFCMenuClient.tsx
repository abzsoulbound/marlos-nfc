"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuSection } from "@/lib/menu";
import { MenuView } from "@/lib/MenuView";

export default function NFCMenuClient({
  tagId,
  sections,
}: {
  tagId: string;
  sections: MenuSection[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function add(id: string) {
    setQuantities(q => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  }

  function remove(id: string) {
    setQuantities(q => ({ ...q, [id]: Math.max((q[id] ?? 0) - 1, 0) }));
  }

  const hasItems = Object.values(quantities).some(v => v > 0);

  async function submitOrder() {
    if (!hasItems || submitting) return;

    setSubmitting(true);
    try {
      const items = sections.flatMap(section =>
        section.items
          .filter(item => (quantities[item.id] ?? 0) > 0)
          .map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantities[item.id],
          }))
      );

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, items }),
      });

      if (!res.ok) return;

      router.push(`/t/${tagId}/review`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "#0b0f14", minHeight: "100vh" }}>
      {/* BRAND HEADER */}
      <header
        style={{
          background: "#dbe7ec",
          padding: "28px 16px 22px",
          textAlign: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <img
          src="/marlos-logo.png"
          alt="Marlo’s Brasserie"
          style={{
            maxWidth: 220,
            width: "70%",
            height: "auto",
          }}
        />
      </header>

      {/* MENU */}
      <main style={{ color: "#fff" }}>
        <MenuView
          sections={sections}
          quantities={quantities}
          onAdd={add}
          onRemove={remove}
          interactive
        />
      </main>

      {/* FOOTER CTA */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "linear-gradient(to top, #0b0f14, rgba(11,15,20,0.85))",
          padding: "14px 16px 18px",
        }}
      >
        <button
          disabled={!hasItems || submitting}
          onClick={submitOrder}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            background: hasItems ? "#3b82f6" : "#2a2f36",
            color: "#fff",
            cursor: hasItems ? "pointer" : "default",
          }}
        >
          Review order
        </button>
      </div>
    </div>
  );
}
