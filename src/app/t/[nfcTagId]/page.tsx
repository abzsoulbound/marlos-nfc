import { menu } from "@/lib/menu";
import NFCMenuClient from "./NFCMenuClient";

export default function TablePage({
  params,
}: {
  params: { nfcTagId: string };
}) {
  return (
    <NFCMenuClient
      tagId={params.nfcTagId}
      sections={[...menu].sort((a, b) => a.order - b.order)}
    />
  );
}
