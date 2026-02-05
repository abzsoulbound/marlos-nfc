"use client";

import { useEffect, useMemo, useState } from "react";
import { menu } from "@/lib/menu";

type Cart = Record<string, number>;

function getItemById(id: string) {
  for (const sec of menu) {
    const item = sec.items.find(i => i.id === id);
    if (item) return item;
  }
  return null;
}

function stationFor(sectionId: string): "KITCHEN" | "BAR" {
  // Simple routing: drinks sections => BAR, everything else => KITCHEN
  const barSections = new Set(["hot-drinks", "cold-drinks", "cocktails", "wines", "beers", "soft-drinks", "spirits"]);
  return barSections.has(sectionId) ? "BAR" : "KITCHEN";
}

export default function NFCTagClient({ nfcTagId }: { nfcTagId: string }) {
  const [activeSection, setActiveSection] = useState(menu[0]?.id);
  const [cart, setCart] = useState<Cart>({});
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    // open/resume session
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", tagId: nfcTagId }),
    }).catch(() => {});
  }, [nfcTagId]);

  const section = useMemo(() => menu.find(s => s.id === activeSection) ?? menu[0], [activeSection]);
  const items = section?.items ?? [];

  const totalQty = Object.values(cart).reduce((a,b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = getItemById(id);
    if (!item) return sum;
    return sum + (item.price * qty);
  }, 0);

  function add(id: string) {
    setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function remove(id: string) {
    setCart(c => {
      const next = { ...c };
      const v = next[id] ?? 0;
      if (v <= 1) delete next[id];
      else next[id] = v - 1;
      return next;
    });
  }

  async function submit() {
    setMsg("");
    const payloadItems = Object.entries(cart)
      .map(([id, quantity]) => {
        const item = getItemById(id);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
          station: stationFor(section?.id ?? ""),
        };
      })
      .filter(Boolean) as any[];

    if (payloadItems.length === 0) {
      setMsg("Basket empty");
      return;
    }

    const res = await fetch("/api/orders/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId: nfcTagId, items: payloadItems, notes }),
    });

    if (!res.ok) {
      const text = await res.text();
      setMsg(text || ("Submit failed HTTP " + res.status));
      return;
    }

    setCart({});
    setNotes("");
    setMsg("Order submitted");
  }

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Marlo’s Brasserie</h1>
        <p style={{ opacity: 0.75, marginTop: 4 }}>Tag: {nfcTagId}</p>
      </header>

      <nav style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
        {menu
          .slice()
          .sort((a,b) => a.order - b.order)
          .map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: "8px 10px",
                border: "1px solid #ccc",
                background: s.id === activeSection ? "#eee" : "white",
                whiteSpace: "nowrap",
              }}
            >
              {s.title}
            </button>
          ))}
      </nav>

      <section>
        <h2 style={{ marginTop: 0 }}>{section?.title}</h2>

        <div style={{ display: "grid", gap: 10 }}>
          {items.map(item => {
            const qty = cart[item.id] ?? 0;
            return (
              <div key={item.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{item.name}</strong>
                  <span>£{item.price.toFixed(2)}</span>
                </div>
                {item.description && <p style={{ marginTop: 6, opacity: 0.85 }}>{item.description}</p>}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <button onClick={() => remove(item.id)} style={{ padding: "6px 10px" }}>-</button>
                  <span style={{ minWidth: 28, textAlign: "center" }}>{qty}</span>
                  <button onClick={() => add(item.id)} style={{ padding: "6px 10px" }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer style={{ position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #ddd", marginTop: 16, paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <strong>{totalQty}</strong> item(s) — <strong>£{totalPrice.toFixed(2)}</strong>
          </div>
          <button onClick={() => submit()} style={{ padding: "10px 14px" }}>
            Submit order
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </footer>
    </main>
  );
}
