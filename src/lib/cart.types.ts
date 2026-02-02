export interface CartItem {
  itemId: string;
  name: string;
  quantity: number;
  lineTotal: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type SerializedCart = Cart;
