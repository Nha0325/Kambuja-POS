import { create } from "zustand";
import { AUTH_STORAGE_KEY } from "../../../shared/utils/constants";

const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "null");

export const useAuthStore = create((set) => ({
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  setAuth: (auth) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    set(auth);
  },
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ token: null, user: null });
  },
}));
