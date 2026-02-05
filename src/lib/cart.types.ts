export interface CartItem {
  itemId: string;
  name: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface SerializedCart {
  items: CartItem[];
}
