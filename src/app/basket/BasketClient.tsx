"use client";

import { useSearchParams } from "next/navigation";

export default function BasketClient() {
  const searchParams = useSearchParams();
  const table = searchParams.get("t");

  return (
    <main>
      <h1>Basket</h1>
      <p>Table: {table}</p>
    </main>
  );
}
