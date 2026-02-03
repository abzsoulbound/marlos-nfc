"use client";

type Section = {
  id: string;
  title: string;
  icon?: string;
};

export default function SectionTabs({ sections }: { sections: Section[] }) {
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
        zIndex: 10,
        borderBottom: "1px solid #eee",
      }}
    >
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() =>
            document
              .getElementById(`section-${s.id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          style={{
            flex: "0 0 auto",
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            background: "#f9f9f9",
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          {s.icon ? `${s.icon} ` : ""}{s.title}
        </button>
      ))}
    </div>
  );
}
