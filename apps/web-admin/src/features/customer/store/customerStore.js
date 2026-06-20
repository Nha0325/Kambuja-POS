import { create } from "zustand";
export const useCustomerStore = create((set) => ({ customers: [], setCustomers: (customers) => set({ customers }) }));
