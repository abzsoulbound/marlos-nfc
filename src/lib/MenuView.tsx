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
  return (
    <div>
      {/* HORIZONTAL SECTION SCROLLER */}
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
        {sections.map(section => (
          <a
            key={section.id}
            href={`#section-${section.id}`}
            style={{
              flex: "0 0 auto",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#f5f5f5",
              textDecoration: "none",
              color: "#111",
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            {section.title}
          </a>
        ))}
      </div>

      {/* SECTIONS */}
      {sections.map(section => (
        <section
          key={section.id}
          id={`section-${section.id}`}
          style={{ padding: "16px" }}
        >
          <h2 style={{ marginBottom: 12 }}>
            {section.title}
          </h2>

          {section.items.map(item => {
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
      ))}
    </div>
  );
}
