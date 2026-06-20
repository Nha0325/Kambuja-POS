import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],
  lastSale: null,
  lastPayment: null,
  addItem: (product) => {
    const existing = get().items.find((item) => item.productId === product.id);
    set({ items: existing ? get().items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...get().items, { productId: product.id, name: product.name, unitPrice: Number(product.unitPrice), quantity: 1, discount: 0 }] });
  },
  updateQuantity: (productId, quantity) => set({ items: get().items.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item) }),
  removeItem: (productId) => set({ items: get().items.filter((item) => item.productId !== productId) }),
  clear: () => set({ items: [] }),
  setLastSale: (lastSale) => set({ lastSale }),
  setLastPayment: (lastPayment) => set({ lastPayment }),
}));
