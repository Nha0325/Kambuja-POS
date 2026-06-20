import { create } from "zustand";
export const useSettingStore = create((set) => ({ settings: [], telegram: null, setSettings: (settings) => set({ settings }), setTelegram: (telegram) => set({ telegram }) }));
