"use client";

import { useEffect, useMemo, useState } from "react";
import { useKitchenQueue } from "@/lib/useKitchenQueue";
import type { Order } from "@/lib/persist.store";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function KitchenPage() {
  const [staffKey, setStaffKey] = useState("");
  const { orders, error, reload } = useKitchenQueue("KITCHEN");

  useEffect(() => {
    setStaffKey(getKey());
  }, []);

  const grouped = useMemo(() => {
    // Group by tableNumber if exists; else by tagId
    const map = new Map<string, Order[]>();
    for (const o of orders) {
      const k = o.tableNumber ? `Table ${o.tableNumber}` : `Tag ${o.tagId}`;
      const prev = map.get(k) ?? [];
      prev.push(o);
      map.set(k, prev);
    }
    return [...map.entries()];
  }, [orders]);

  async function markReady(orderId: string) {
    const res = await fetch("/api/orders/ready", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ orderId, station: "KITCHEN" }),
    });
    if (!res.ok) throw new Error("ready failed: " + res.status);
    await reload();
  }

  async function deliver(orderId: string) {
    const res = await fetch("/api/orders/deliver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) throw new Error("deliver failed: " + res.status);
    await reload();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Kitchen</h1>

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
      {grouped.length === 0 && !error && <p>No active kitchen orders.</p>}

      {grouped.map(([groupKey, groupOrders]) => (
        <section key={groupKey} style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 8 }}>{groupKey}</h2>

          {groupOrders.map(order => (
            <div key={order.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>Order</strong>
                <span style={{ opacity: 0.8 }}>
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <ul>
                {order.items
                  .filter(i => i.station === "KITCHEN" && i.status !== "DELIVERED" && i.status !== "CANCELLED")
                  .map(item => (
                    <li key={item.id}>
                      {item.quantity}× {item.name} <em>({item.status})</em>
                    </li>
                  ))}
              </ul>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => markReady(order.id)} style={{ padding: "8px 10px" }}>
                  Mark kitchen ready
                </button>
                <button onClick={() => deliver(order.id)} style={{ padding: "8px 10px" }}>
                  Mark delivered
                </button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
