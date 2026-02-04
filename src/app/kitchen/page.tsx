"use client"

import { useKitchenQueue } from "@/lib/useKitchenQueue"

export default function KitchenPage() {
  const { orders, error } = useKitchenQueue()

  return (
    <main style={{ padding: 24 }}>
      <h1>Kitchen</h1>

      {error && (
        <p style={{ color: "red" }}>
          Error loading orders: {error}
        </p>
      )}

      {orders.length === 0 && !error && (
        <p>No active orders.</p>
      )}

      {orders.map(order => (
        <section
          key={order.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 16,
          }}
        >
          <h2>Table {order.tableId}</h2>

          <ul>
            {order.items.map(item => (
              <li key={item.id}>
                {item.quantity}× {item.name}{" "}
                <em>({item.station})</em>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
