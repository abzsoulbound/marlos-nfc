"use client";

import { useState } from "react";
import type { MenuSection } from "@/lib/menu";

type Props = {
  sections: MenuSection[];
  quantities?: Record<string, number>;
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
  interactive?: boolean;
};

export function MenuView({
  sections,
  quantities = {},
  onAdd,
  onRemove,
  interactive = false,
}: Props) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id ?? ""
  );

  const activeSection =
    sections.find(s => s.id === activeSectionId) ?? sections[0];

  return (
    <div>
      {/* SECTION TABS */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {sections.map(section => {
          const active = section.id === activeSectionId;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              style={{
                flex: "0 0 auto",
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                background: active ? "#111" : "#f5f5f5",
                color: active ? "#fff" : "#111",
                fontSize: 14,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      {/* ACTIVE SECTION ONLY */}
      {activeSection && (
        <section style={{ padding: "16px" }}>
          <h2 style={{ marginBottom: 12 }}>
            {activeSection.title}
          </h2>

          {activeSection.items.map(item => {
            const qty = quantities[item.id] ?? 0;

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <p style={{ margin: 0, opacity: 0.7 }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {interactive && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => onRemove?.(item.id)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => onAdd?.(item.id)}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
