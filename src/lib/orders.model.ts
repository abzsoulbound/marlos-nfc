type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  orderId: string;
  table: string;
  items: OrderItem[];
  notes: string;
  createdAt: number;
};

const ORDERS: Order[] = [];

export function createOrder(input: {
  table: string;
  items: OrderItem[];
  notes: string;
}) {
  const order: Order = {
    orderId: crypto.randomUUID(),
    table: input.table,
    items: input.items,
    notes: input.notes,
    createdAt: Date.now(),
  };

  ORDERS.push(order);
  return order;
}

export function getOrders() {
  return ORDERS;
}
