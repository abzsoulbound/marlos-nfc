import NFCTagClient from "./NFCTagClient";

export default async function NFCTagPage({
  params,
}: {
  params: Promise<{ nfcTagId: string }>;
}) {
  const { nfcTagId } = await params;

  return <NFCTagClient nfcTagId={nfcTagId} />;
}
