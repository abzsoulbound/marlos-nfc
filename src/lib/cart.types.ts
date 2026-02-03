export type CartItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Cart = {
  sessionId: string | null;
  nfcTagId: string | null;
  items: Record<string, CartItem>;
};
