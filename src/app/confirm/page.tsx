"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const params = useSearchParams();
  const table = params.get("table");

  async function submit() {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table,
        notes: "",
        items: [], // server already knows basket/session
      }),
    });

    alert("Order sent to kitchen");
  }

  return (
    <main>
      <h1>Confirm Order</h1>
      <p>Table: {table}</p>

      <button onClick={submit}>
        Send to Kitchen
      </button>
    </main>
  );
}
