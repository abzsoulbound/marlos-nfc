"use client"

import { useEffect, useState } from "react"

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const load = () =>
      fetch("/api/kitchen")
        .then(r => r.json())
        .then(d => setOrders(d.orders))

    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main style={{ padding: 24 }}>
      <h1>Kitchen</h1>

      {orders.length === 0 && <p>No active orders</p>}

      {orders.map(order => (
        <div key={order.orderId} style={{ marginBottom: 24 }}>
          <strong>Table {order.table}</strong>

          <ul>
            {order.items.map((i: any) => (
              <li key={i.itemId}>
                {i.name} × {i.quantity} — {i.status}

                {i.status === "pending" && (
                  <button
                    style={{ marginLeft: 12 }}
                    onClick={() =>
                      fetch("/api/kitchen/ready", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: order.orderId,
                          itemId: i.itemId
                        })
                      })
                    }
                  >
                    Mark ready
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  )
}
