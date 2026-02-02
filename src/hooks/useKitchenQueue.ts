// src/hooks/useKitchenQueue.ts

import { useEffect, useState } from "react";
import { fetchKitchenQueue } from "@/lib/kitchen.api";

export function useKitchenQueue(intervalMs = 3000) {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchKitchenQueue();
      setOrders(data.orders);
      setError(null);
    } catch {
      setError("Access denied");
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { orders, error };
}
