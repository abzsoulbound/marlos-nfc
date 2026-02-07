import { use, useEffect, useState } from "react";
import type { BillResponse } from "@/lib/bill.types";

type Params = {
  nfcTagId: string;
};

export default function ReviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { nfcTagId } = use(params);
  const [bill, setBill] = useState<BillResponse | null>(null);

  useEffect(() => {
    fetch(`/api/bills?tagId=${nfcTagId}`)
      .then(res => res.json())
      .then(setBill);
  }, [nfcTagId]);

  if (!bill) return null;

  return (
    <main>
      {/* existing review UI stays exactly as-is */}
    </main>
  );
}
