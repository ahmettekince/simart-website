import { create } from 'zustand';

export const useLangStore = create((set) => ({
    lang: 'tr',
    setLang: (newLang) => set({ lang: newLang }),
}));
