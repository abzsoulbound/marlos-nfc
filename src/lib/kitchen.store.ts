import { persistItemDelivery } from "./kitchen.persistence"
import { emit } from "./realtime.bus"

export function markItemDelivered(
  session: any,
  orderId: string,
  itemId: string,
  staffId: string
) {
  const order = session.orders.find((o: any) => o.id === orderId)
  if (!order) return

  const item = order.items.find((i: any) => i.id === itemId)
  if (!item || item.delivered) return

  item.delivered = true
  item.deliveredAt = Date.now()
  item.deliveredBy = staffId

  persistItemDelivery(session.id, orderId, item)

  emit("ITEM_DELIVERED", {
    sessionId: session.id,
    orderId,
    itemId
  })
}
