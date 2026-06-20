import { create } from "zustand";

export const useSettingStore = create((set) => ({
  settings: [],
  setSettings: (settings) => set({ settings }),
}));
