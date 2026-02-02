"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { menu } from "@/lib/menu";

export default function BasketPage() {
  const params = useSearchParams();
  const [items, setItems] = useState<Record<string, number>>({});

  useEffect(() => {
    const add = params.get("add");
    if (!add) return;

    setItems(prev => ({
      ...prev,
      [add]: (prev[add] ?? 0) + 1,
    }));
  }, [params]);

  const flatMenu = menu.flatMap(section => section.items);

  const resolved = Object.entries(items)
    .map(([id, qty]) => {
      const item = flatMenu.find(i => i.id === id);
      if (!item) return null;
      return { ...item, qty };
    })
    .filter(Boolean) as any[];

  const total = resolved.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <main>
      <h1>Basket</h1>

      {resolved.map(item => (
        <div key={item.id}>
          {item.name} × {item.qty} — £{(item.price * item.qty).toFixed(2)}
        </div>
      ))}

      <hr />

      <strong>Total: £{total.toFixed(2)}</strong>

      <br /><br />

      <a href={`/confirm?table=${params.get("table") ?? ""}`}>
        Confirm Order → 
      </a>
    </main>
  );
}
