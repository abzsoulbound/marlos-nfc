// src/lib/kitchen.api.ts

export async function fetchKitchenQueue() {
  const res = await fetch("/api/kitchen", {
    headers: {
      "x-staff-key": "marlo-kitchen-001",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Kitchen access denied");
  return res.json();
}

export async function acceptKitchenOrder(orderId: string) {
  return fetch("/api/kitchen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-staff-key": "marlo-kitchen-001",
    },
    body: JSON.stringify({ action: "accept", orderId }),
  });
}

export async function completeKitchenItem(orderId: string, itemId: string) {
  return fetch("/api/kitchen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-staff-key": "marlo-kitchen-001",
    },
    body: JSON.stringify({
      action: "completeItem",
      orderId,
      itemId,
    }),
  });
}
