import { create } from "zustand";

export const useReportStore = create((set) => ({
  sales: [],
  stock: [],
  setSales: (sales) => set({ sales }),
  setStock: (stock) => set({ stock }),
}));
