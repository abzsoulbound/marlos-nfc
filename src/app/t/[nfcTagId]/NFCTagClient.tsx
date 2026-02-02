"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { menu } from "@/lib/menu";

type Cart = Record<string, number>;

type NFCTagClientProps = {
  nfcTagId: string;
};

export default function NFCTagClient({ nfcTagId }: NFCTagClientProps) {
  const router = useRouter();

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<Cart>({});

  function toggleSection(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));
  }

  function addItem(itemId: string) {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
  }

  function removeItem(itemId: string) {
    setCart((prev) => {
      const current = prev[itemId] ?? 0;
      if (current <= 0) return prev;

      const next = { ...prev };
      const updated = current - 1;

      if (updated <= 0) delete next[itemId];
      else next[itemId] = updated;

      return next;
    });
  }

  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;

    for (const section of menu) {
      for (const item of section.items) {
        const qty = cart[item.id] ?? 0;
        if (qty > 0) {
          items += qty;
          price += qty * item.price;
        }
      }
    }

    return { totalItems: items, totalPrice: price };
  }, [cart]);

  const hasItems = totalItems > 0;

  function handleReview() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cart", JSON.stringify(cart));
    }
    router.push(`/t/${nfcTagId}/review`);
  }

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 720,
        margin: "0 auto",
        lineHeight: 1.4,
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>
          Marlo’s Brasserie
        </h1>
        <p style={{ opacity: 0.7 }}>
          Table / Tag ID: {nfcTagId || "UNKNOWN"}
        </p>
      </header>

      {menu.map((section) => {
        const isOpen = open[section.id] ?? false;

        return (
          <section key={section.id} style={{ marginBottom: 18 }}>
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "14px 0",
                fontSize: 18,
                fontWeight: 600,
                borderBottom: "1px solid #333",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              {section.title} {isOpen ? "▾" : "▸"}
            </button>

            {isOpen &&
              section.items.map((item) => {
                const qty = cart[item.id] ?? 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #222",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <strong>{item.name}</strong>
                      <span>£{item.price.toFixed(2)}</span>
                    </div>

                    {item.description && (
                      <p
                        style={{
                          fontSize: 14,
                          opacity: 0.8,
                          marginTop: 6,
                        }}
                      >
                        {item.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={qty === 0}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #333",
                          background: qty === 0 ? "#111" : "#0a0a0a",
                          color: "inherit",
                          opacity: qty === 0 ? 0.5 : 1,
                          cursor: qty === 0 ? "default" : "pointer",
                        }}
                      >
                        −
                      </button>

                      <span
                        style={{
                          minWidth: 28,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {qty}
                      </span>

                      <button
                        onClick={() => addItem(item.id)}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid #333",
                          background: "#0a0a0a",
                          color: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
          </section>
        );
      })}

      {hasItems && (
        <footer
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 18,
            padding: 14,
            background: "#0a0a0a",
            borderTop: "1px solid #333",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <span style={{ opacity: 0.85 }}>
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </span>
            <strong>£{totalPrice.toFixed(2)}</strong>
          </div>

          <button
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={handleReview}
          >
            Review Order
          </button>
        </footer>
      )}
    </main>
  );
}
