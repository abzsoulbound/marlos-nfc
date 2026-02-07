"use client";

import { useState } from "react";
import type { MenuSection } from "@/lib/menu";
import { MenuView } from "@/lib/MenuView";

export default function NFCMenuClient({
  tableId,
  sections,
}: {
  tableId: string;
  sections: MenuSection[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

  return (
    <>
      <header className="hero">
        <h1>Marlo’s Brasserie</h1>
        <p>Table {tableId}</p>
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
        <button disabled={!hasItems}>Review order</button>
      </div>
    </>
  );
}
