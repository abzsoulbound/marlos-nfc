import { use } from "react";
import { menu } from "@/lib/menu";
import NFCMenuClient from "./NFCMenuClient";

type Params = {
  nfcTagId: string;
};

export default function TableMenuPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { nfcTagId } = use(params);

  return (
    <NFCMenuClient
      tagId={nfcTagId}
      sections={[...menu].sort((a, b) => a.order - b.order)}
    />
  );
}
