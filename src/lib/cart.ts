import { create } from "zustand";

export type CartItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartState = {
  sessionId: string | null;
  nfcTagId: string | null;
  items: Record<string, CartItem>;

  initSession: (nfcTagId: string) => void;
  add: (item: CartItem) => void;
  remove: (itemId: string) => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  sessionId: null,
  nfcTagId: null,
  items: {},

  initSession: (nfcTagId) =>
    set({ nfcTagId }),

  add: (item) =>
    set((state) => {
      const existing = state.items[item.itemId];
      return {
        items: {
          ...state.items,
          [item.itemId]: existing
            ? { ...existing, quantity: existing.quantity + item.quantity }
            : item,
        },
      };
    }),

  remove: (itemId) =>
    set((state) => {
      const next = { ...state.items };
      delete next[itemId];
      return { items: next };
    }),

  totalItems: () =>
    Object.values(get().items).reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    Object.values(get().items).reduce(
      (sum, i) => sum + i.quantity * i.price,
      0
    ),
}));
