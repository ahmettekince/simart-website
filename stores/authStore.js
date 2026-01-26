import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
    isAuthenticated: false,
    user: null,
    isInitialized: false,

    // Auth durumunu initialize et
    initAuth: async () => {
        if (typeof window === 'undefined') return;

        try {
            // Sunucu tarafındaki kontrol endpoint'ine istek at
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            
            set({ 
                isAuthenticated: data.isAuthenticated === true, 
                isInitialized: true 
            });
        } catch (error) {
            console.error("Auth init error:", error);
            set({ isAuthenticated: false, isInitialized: true });
        }
    },

    // Login sonrası auth durumunu güncelle
    setAuthenticated: (value) => {
        set({ isAuthenticated: value });
    },

    // Logout
    logout: () => {
        set({ isAuthenticated: false, user: null });
    }
}));
