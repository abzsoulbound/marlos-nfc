"use client";

import { useState } from "react";
import { MenuView } from "@/lib/MenuView";
import type { MenuSection } from "@/lib/menu.types";

export default function NFCClient({
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

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <h1>Marlo’s Brasserie</h1>
        <span>Table {tableId}</span>
      </header>

      {/* MENU */}
      <main>
        <MenuView
          sections={sections}
          quantities={quantities}
          onAdd={add}
          onRemove={remove}
          interactive
        />
      </main>
    </>
  );
}
