"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { menu } from "@/lib/menu";

type Cart = Record<string, number>;

export default function NFCTagClient({ nfcTagId }: { nfcTagId: string }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(menu[0]?.id);
  const [cart, setCart] = useState<Cart>({});

  const items = useMemo(() => {
    const section = menu.find(s => s.id === activeSection);
    return section?.items ?? [];
  }, [activeSection]);

  const totalCount = Object.values(cart).reduce((a, b) => a + b, 0);

  function add(id: string) {
    setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  function remove(id: string) {
    setCart(c => {
      const next = { ...c };
      if (!next[id]) return next;
      if (next[id] === 1) delete next[id];
      else next[id]--;
      return next;
    });
  }

  return (
    <main
      style={{
        background: "#0B1220",
        minHeight: "100vh",
        color: "#E5E7EB",
        padding: 16,
      }}
    >
      {/* Header */}
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>
        Table {nfcTagId}
      </h1>

      {/* Section Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
        {menu.map(section => {
          const active = section.id === activeSection;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                background: active ? "#1E40AF" : "#111B2E",
                color: active ? "#fff" : "#9CA3AF",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div>
        {items.map(item => {
          const qty = cart[item.id] ?? 0;

          return (
            <div
              key={item.id}
              style={{
                background: "#111B2E",
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                border: "1px solid #1F2A44",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{item.name}</strong>
                <span style={{ color: "#38BDF8", fontWeight: 600 }}>
                  £{item.price.toFixed(2)}
                </span>
              </div>

              {item.description && (
                <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
                  {item.description}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <button
                  onClick={() => remove(item.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background: "#1E293B",
                    color: "#3B82F6",
                    fontSize: 18,
                  }}
                >
                  −
                </button>

                <span style={{ minWidth: 16, textAlign: "center" }}>{qty}</span>

                <button
                  onClick={() => add(item.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background: "#1E293B",
                    color: "#3B82F6",
                    fontSize: 18,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Button */}
      {totalCount > 0 && (
        <button
          onClick={() => {
            sessionStorage.setItem("cart", JSON.stringify(cart));
            router.push(`/t/${nfcTagId}/review`);
          }}
          style={{
            position: "sticky",
            bottom: 16,
            width: "100%",
            marginTop: 20,
            padding: 16,
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Review Order ({totalCount})
        </button>
      )}
    </main>
  );
}
