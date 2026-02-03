export const runtime = "edge";



import NFCTagClient from "./NFCTagClient";

type PageProps = {
  params: Promise<{
    nfcTagId: string;
  }>;
};

export default async function NFCTablePage({ params }: PageProps) {
  const { nfcTagId } = await params;

  if (!nfcTagId) {
    return <div>Invalid table</div>;
  }

  return <NFCTagClient nfcTagId={nfcTagId} />;
}
