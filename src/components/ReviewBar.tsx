"use client";

import { useCart } from "@/lib/cart";
import { useRouter } from "next/navigation";

export default function ReviewBar() {
  const { totalItems, totalPrice } = useCart();
  const router = useRouter();
  const count = totalItems();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        background: "#fff",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 30,
      }}
    >
      <div>
        {count} items · £{totalPrice().toFixed(2)}
      </div>
      <button
        disabled={count === 0}
        onClick={() => router.push("/order/review")}
      >
        Review order
      </button>
    </div>
  );
}
