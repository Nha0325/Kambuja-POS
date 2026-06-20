import { create } from "zustand";

export const useAdminManagerStore = create((set) => ({
  dashboard: null,
  setDashboard: (dashboard) => set({ dashboard }),
}));
