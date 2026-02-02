export async function persistItemDelivery(
  sessionId: string,
  orderId: string,
  item: any
) {
  await fetch(
    `/api/sessions/${sessionId}/orders/${orderId}/items/${item.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delivered: true,
        deliveredAt: item.deliveredAt,
        deliveredBy: item.deliveredBy
      })
    }
  )
}
