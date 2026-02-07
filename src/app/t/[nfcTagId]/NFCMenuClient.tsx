"use client";

import { useState } from "react";
import type { MenuSection } from "@/lib/menu.types";
import { MenuView } from "@/lib/MenuView";

export default function NFCMenuClient({
  sections,
}: {
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
    <main>
      <MenuView
        sections={sections}
        quantities={quantities}
        onAdd={add}
        onRemove={remove}
        interactive
      />

      <footer className="footer">
        <button disabled={!Object.values(quantities).some(v => v > 0)}>
          Review order
        </button>
      </footer>
    </main>
  );
}
