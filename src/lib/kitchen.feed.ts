export function getKitchenFeed(session: any, station: "kitchen" | "bar") {
  return session.orders.flatMap((order: any) =>
    order.items
      .filter(
        (i: any) =>
          i.fulfilment === station &&
          !i.delivered
      )
      .map((i: any) => ({
        orderId: order.id,
        item: i
      }))
  )
}
