"use client";

import type { MenuSection } from "@/lib/menu";

export function MenuView({
  sections,
  quantities,
  onAdd,
  onRemove,
  interactive = false,
}: {
  sections: MenuSection[];
  quantities: Record<string, number>;
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
  interactive?: boolean;
}) {
  return (
    <>
      {sections.map(section => (
        <section key={section.id}>
          <div className="section-title">{section.title}</div>

          {section.items.map(item => (
            <div key={item.id} className="menu-item">
              <div className="item-header">
                <div className="item-title">{item.name}</div>
                <div className="item-price">
                  £{item.price.toFixed(2)}
                </div>
              </div>

              {item.description && (
                <div className="item-desc">{item.description}</div>
              )}

              {interactive && (
                <div className="qty">
                  <button onClick={() => onRemove?.(item.id)}>−</button>
                  <span>{quantities[item.id] ?? 0}</span>
                  <button onClick={() => onAdd?.(item.id)}>+</button>
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
