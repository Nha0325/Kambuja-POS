import { create } from 'zustand';
import { api } from '../services/api';

export const useI18nStore = create((set, get) => ({
    lang: localStorage.getItem('kambuja-pos-lang') || 'km',
    messages: {},
    isLoading: true,

    setLang: async (newLang) => {
        set({ isLoading: true });
        try {
            const res = await api.get(`/i18n/messages?lang=${newLang}`);
            localStorage.setItem('kambuja-pos-lang', newLang);
            set({ lang: newLang, messages: res.data, isLoading: false });
        } catch (error) {
            console.error("Failed to load language", error);
            set({ isLoading: false });
        }
    },

    init: () => {
        get().setLang(get().lang);
    },

    t: (key, fallback) => {
        const { messages } = get();
        return messages[key] || fallback || key;
    }
}));
