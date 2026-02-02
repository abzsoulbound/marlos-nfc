export type TableId = string
export type OrderId = string
export type ItemId = string

export enum OrderStatus {
  OPEN = "OPEN",           // customer adding items
  SUBMITTED = "SUBMITTED", // visible to kitchen/bar
  READY = "READY",         // station marked ready
  DELIVERED = "DELIVERED", // waiter confirmed via NFC
  CLOSED = "CLOSED",       // session fully ended
}

export type Station = "KITCHEN" | "BAR"

export interface OrderItem {
  id: ItemId
  name: string
  quantity: number
  station: Station
}

export interface Order {
  id: OrderId
  tableId: TableId
  items: OrderItem[]
  status: OrderStatus
  createdAt: number
  updatedAt: number
}
