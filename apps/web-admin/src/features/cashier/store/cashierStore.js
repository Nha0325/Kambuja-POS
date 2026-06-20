import { create } from "zustand";
export const useCashierStore = create((set) => ({ cashiers: [], setCashiers: (cashiers) => set({ cashiers }) }));
