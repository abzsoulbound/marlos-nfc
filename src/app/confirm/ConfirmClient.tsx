"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmClient() {
  const searchParams = useSearchParams();

  const billId = searchParams.get("billId");

  return (
    <main>
      <h1>Order confirmed</h1>
      <p>Bill ID: {billId}</p>
    </main>
  );
}
