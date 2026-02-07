import { menu } from "@/lib/menu";
import NFCMenuClient from "./NFCMenuClient";

export default async function TablePage({
  params,
}: {
  params: Promise<{ nfcTagId: string }>;
}) {
  const { nfcTagId } = await params;

  return (
    <NFCMenuClient
      tagId={nfcTagId}
      sections={[...menu].sort((a, b) => a.order - b.order)}
    />
  );
}
