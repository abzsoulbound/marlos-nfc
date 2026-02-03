"use client";

import { useEffect, useState } from "react";

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders.filter((o: any) => o.state !== "closed"));
    };

    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Kitchen</h1>

      {orders.map(o => (
        <section key={o.orderId} style={{ marginBottom: 24 }}>
          <strong>
            {o.table ? `Table ${o.table}` : `NFC ${o.nfcTagId}`}
          </strong>

          <ul>
            {o.items
              .filter((i: any) => i.area === "kitchen" && !i.delivered)
              .map((i: any) => (
                <li key={i.itemId}>
                  {i.name} × {i.quantity}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
