import { menu } from "@/lib/menu";
import { MenuView } from "@/lib/MenuView";

export default function TablePage({
  params,
}: {
  params: { nfcTagId: string };
}) {
  return (
    <>
      {/* Hero */}
      <div
        style={{
          padding: "24px 16px 20px",
          background: "linear-gradient(180deg, #2563eb, #3b82f6)",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          Marlo’s Brasserie
        </div>
        <div style={{ opacity: 0.9, marginTop: 4 }}>
          Table {params.nfcTagId}
        </div>
      </div>

      {/* Menu */}
      <main>
        <MenuView
          sections={[...menu].sort((a, b) => a.order - b.order)}
          quantities={{}}
          interactive
        />
      </main>

      {/* Footer CTA */}
      <div className="footer">
        <button>View order</button>
      </div>
    </>
  );
}
