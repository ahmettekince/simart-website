import axios from "axios";
import { useLangStore } from "@/stores/langStore";

const apiClient = axios.create({
    baseURL: "/api/proxy",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Cookie'leri otomatik gönder (client-side için gerekli)
});

// Interceptor for language and FormData
apiClient.interceptors.request.use((config) => {
    // Add language from state
    const lang = useLangStore.getState().lang || "tr";

    // X-Api-Lang header'ını ekle
    config.headers = {
        ...config.headers,
        "X-Api-Lang": lang
    };

    const method = config.method?.toLowerCase();

    // Body olan isteklerde (POST, PUT vb.) Body'ye eklemiyoruz artık, sadece header üzerinden.

    // Remove Content-Type if it's FormData (Browser sets it automatically with boundary)
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

export default apiClient;
