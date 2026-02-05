"use client";

import { useEffect, useState } from "react";
import { useKitchenQueue } from "@/lib/useKitchenQueue";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function BarPage() {
  const [staffKey, setStaffKey] = useState("");
  const { orders, error, reload } = useKitchenQueue("BAR");

  useEffect(() => setStaffKey(getKey()), []);

  async function markReady(orderId: string) {
    const res = await fetch("/api/orders/ready", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ orderId, station: "BAR" }),
    });
    if (!res.ok) throw new Error("ready failed: " + res.status);
    await reload();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Bar</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Staff key</span>
          <input
            value={staffKey}
            onChange={(e) => {
              setStaffKey(e.target.value);
              localStorage.setItem("STAFF_KEY", e.target.value);
            }}
            placeholder="STAFF_KEY"
            style={{ padding: 8, width: 280 }}
          />
        </label>
        <button onClick={() => reload()} style={{ padding: "8px 12px" }}>Refresh</button>
      </div>

      {error && <p style={{ color: "red" }}>Error loading orders: {error}</p>}
      {orders.length === 0 && !error && <p>No active bar orders.</p>}

      {orders.map(order => (
        <section key={order.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
          <h2>{order.tableNumber ? `Table ${order.tableNumber}` : `Tag ${order.tagId}`}</h2>

          <ul>
            {order.items
              .filter(i => i.station === "BAR" && i.status !== "DELIVERED" && i.status !== "CANCELLED")
              .map(item => (
                <li key={item.id}>
                  {item.quantity}× {item.name} <em>({item.status})</em>
                </li>
              ))}
          </ul>

          <button onClick={() => markReady(order.id)} style={{ padding: "8px 10px" }}>
            Mark bar ready
          </button>
        </section>
      ))}
    </main>
  );
}
