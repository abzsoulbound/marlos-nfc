"use client";

import { useEffect, useState } from "react";
import type { Order } from "./persist.store";

export function useKitchenQueue(station: "KITCHEN" | "BAR" = "KITCHEN") {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const url = station === "BAR" ? "/api/orders/bar" : "/api/orders/kitchen";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "fetch failed");
    }
  }

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    let es: EventSource | null = null;

    load();

    // SSE (realtime), with polling fallback
    try {
      es = new EventSource("/api/realtime");
      es.onmessage = () => {
        if (!alive) return;
        load();
      };
      es.onerror = () => {
        // If SSE fails, fall back to polling
        if (!alive) return;
        if (timer === null) timer = window.setInterval(load, 3000);
      };
    } catch {
      timer = window.setInterval(load, 3000);
    }

    // Ensure periodic refresh even if no events
    if (timer === null) timer = window.setInterval(load, 6000);

    return () => {
      alive = false;
      if (timer !== null) clearInterval(timer);
      if (es) es.close();
    };
  }, [station]);

  return { orders, error, reload: load };
}
