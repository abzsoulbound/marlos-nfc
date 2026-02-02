type OrderItem = {
  itemId: string
  name: string
  quantity: number
  status: "pending" | "ready"
}

type Order = {
  orderId: string
  table: string
  createdAt: number
  delivered: boolean
  items: OrderItem[]
}

const orders: Order[] = [
  {
    orderId: "ord_1",
    table: "5",
    createdAt: Date.now(),
    delivered: false,
    items: [
      { itemId: "i1", name: "Burger", quantity: 2, status: "pending" },
      { itemId: "i2", name: "Fries", quantity: 1, status: "pending" }
    ]
  }
]

export function getActiveOrders() {
  return orders
    .filter(o => !o.delivered)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function markItemReady(orderId: string, itemId: string) {
  const order = orders.find(o => o.orderId === orderId)
  if (!order) return

  const item = order.items.find(i => i.itemId === itemId)
  if (!item) return

  item.status = "ready"

  if (order.items.every(i => i.status === "ready")) {
    order.delivered = true
  }
}
