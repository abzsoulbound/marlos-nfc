export default function NFCTagClient({ nfcTagId }: { nfcTagId: string }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>Table {nfcTagId}</h1>
    </main>
  );
}

export const runtime = "edge";
