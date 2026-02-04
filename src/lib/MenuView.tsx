"use client";

import { menu } from "./menu";

export default function MenuView({
  interactive,
  onAdd,
  onRemove,
  quantities = {},
}: {
  interactive?: boolean;
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
  quantities?: Record<string, number>;
}) {
  return (
    <div>
      {menu.map(section => (
        <section key={section.id} style={{ marginBottom: 24 }}>
          <h2>{section.title}</h2>

          {section.items.map(item => (
            <div
              key={item.id}
              style={{
                border: "1px solid #222",
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
              }}
            >
              <strong>{item.name}</strong>
              <p>{item.description}</p>
              <div>£{item.price.toFixed(2)}</div>

              {interactive && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => onRemove?.(item.id)}>-</button>
                  <span style={{ margin: "0 12px" }}>
                    {quantities[item.id] ?? 0}
                  </span>
                  <button onClick={() => onAdd?.(item.id)}>+</button>
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
