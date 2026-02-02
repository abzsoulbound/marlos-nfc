"use client";

import { useState } from "react";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Cart = {
  items: CartItem[];
};

const EMPTY_CART: Cart = { items: [] };

export default function HomePage() {
  const [cart, setCart] = useState<Cart>({
    items: [
      { id: "1", name: "Coffee", quantity: 1, price: 3 },
      { id: "2", name: "Cake", quantity: 2, price: 4 },
    ],
  });

  const [mode, setMode] = useState<"edit" | "review">("edit");
  const [reviewCart, setReviewCart] = useState<Cart | null>(null);

  function onReviewOrder() {
    setReviewCart(structuredClone(cart));
    setMode("review");
  }

  async function submitOrder() {
    if (!reviewCart) return;

    await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewCart),
    });

    setCart(EMPTY_CART);
    setReviewCart(null);
    setMode("edit");
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Place Order</h1>

      {cart.items.map((item) => (
        <div key={item.id}>
          {item.name} × {item.quantity} (£{item.price})
        </div>
      ))}

      <button
        onClick={onReviewOrder}
        style={{ marginTop: 20, padding: 12 }}
      >
        Review Order
      </button>
    </main>
  );
}
