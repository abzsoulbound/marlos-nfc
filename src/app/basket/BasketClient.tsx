"use client";

import { useSearchParams } from "next/navigation";

export default function BasketClient() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table");

  return (
    <div>
      Basket for table {table}
    </div>
  );
}
