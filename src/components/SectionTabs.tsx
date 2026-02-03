"use client";

export default function SectionTabs({ sections }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        padding: "12px 16px",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 20,
        borderBottom: "1px solid #eee",
      }}
    >
      {sections.map((s: any) => (
        <button
          key={s.id}
          onClick={() =>
            document
              .getElementById(`section-${s.id}`)
              ?.scrollIntoView({ behavior: "smooth" })
          }
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            background: "#f9f9f9",
            whiteSpace: "nowrap",
            fontSize: 14,
          }}
        >
          {s.icon ? `${s.icon} ` : ""}
          {s.title}
        </button>
      ))}
    </div>
  );
}
