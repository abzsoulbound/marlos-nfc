"use client";

import { useCart } from "@/lib/cart";

export default function MenuItem({ item }: any) {
  const { add, remove, items } = useCart();
  const qty = items[item.id]?.quantity ?? 0;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderBottom: "1px solid #eee",
      }}
    >
      <img
        src={`https://source.unsplash.com/featured/?${encodeURIComponent(
          item.name
        )}`}
        style={{
          width: 96,
          height: 96,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0 }}>{item.name}</h4>
        <p style={{ opacity: 0.7, margin: "4px 0" }}>
          {item.description}
        </p>
        <strong>£{item.price.toFixed(2)}</strong>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button disabled={qty === 0} onClick={() => remove(item.id)}>
            −
          </button>
          <span>{qty}</span>
          <button
            onClick={() =>
              add({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
              })
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
