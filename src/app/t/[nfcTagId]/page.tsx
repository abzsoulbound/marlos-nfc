import { menu } from "@/lib/menu";
import NFCMenuClient from "./NFCMenuClient";

export default function TablePage({
  params,
}: {
  params: { nfcTagId: string };
}) {
  return (
    <>
      {/* Hero */}
      <header className="hero">
        <h1>Marlo’s Brasserie</h1>
        <p>Table {params.nfcTagId}</p>
      </header>

      {/* Client boundary */}
      <NFCMenuClient
        sections={[...menu].sort((a, b) => a.order - b.order)}
      />
    </>
  );
}
