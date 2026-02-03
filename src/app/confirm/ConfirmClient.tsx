"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main>
      <h1>Confirm</h1>
      <p>Order: {orderId}</p>
    </main>
  );
}
