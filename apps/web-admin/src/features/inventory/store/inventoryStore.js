import { create } from "zustand";
export const useInventoryStore = create((set) => ({ inventory: [], movements: [], setInventory: (inventory) => set({ inventory }), setMovements: (movements) => set({ movements }) }));
