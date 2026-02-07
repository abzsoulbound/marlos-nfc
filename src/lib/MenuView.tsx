import type { MenuSection } from "@/lib/menu.types";

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
        <section key={section.id} className="menu-section">
          <h2 className="section-title">{section.title}</h2>

          {section.items.map(item => (
            <div key={item.id} className="menu-item">
              <div className="item-header">
                <div className="item-title">{item.name}</div>
                <div className="item-price">£{item.price.toFixed(2)}</div>
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
