import { create } from 'zustand';

export const useLangStore = create((set) => ({
    lang: 'tr',
    alternatePaths: {}, // { tr: '/magaza/robot-supurge', en: '/en/shop/robot-vacuum' }
    setLang: (newLang) => set({ lang: newLang }),
    setAlternatePaths: (paths) => set({ alternatePaths: paths }),
}));
