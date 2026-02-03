import { Suspense } from "react";
import BasketClient from "./BasketClient";

export default function BasketPage() {
  return (
    <Suspense fallback={null}>
      <BasketClient />
    </Suspense>
  );
}
