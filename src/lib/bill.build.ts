export function buildBill(session: any) {
  return session.orders.flatMap((order: any) =>
    order.items.filter((i: any) => i.delivered)
  )
}
