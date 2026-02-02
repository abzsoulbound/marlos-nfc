export function canCloseSession(session: any): boolean {
  return !session.orders.some((order: any) =>
    order.items.some((i: any) => !i.delivered)
  )
}
