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
    setQuantities(q => ({
      ...q,
      [id]: Math.max((q[id] ?? 0) - 1, 0),
    }));
  }

  const hasItems = Object.values(quantities).some(v => v > 0);

  async function submitOrder() {
    if (!hasItems || submitting) return;

    setSubmitting(true);
    try {
      const selected = sections.flatMap(section =>
        section.items
          .filter(item => (quantities[item.id] ?? 0) > 0)
          .map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantities[item.id],
            // station omitted => server normalises to KITCHEN
          }))
      );

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagId,
          items: selected,
          notes: "",
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      router.push(`/t/${encodeURIComponent(tagId)}/review`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="hero">
        <h1>Marlo’s Brasserie</h1>
        <p>Table {tagId}</p>
      </header>

      <main>
        <MenuView
          sections={sections}
          quantities={quantities}
          onAdd={add}
          onRemove={remove}
          interactive
        />
      </main>

      <div className="footer">
        <button disabled={!hasItems || submitting} onClick={submitOrder}>
          {submitting ? "Submitting…" : "Review order"}
        </button>
      </div>
    </>
  );
}
