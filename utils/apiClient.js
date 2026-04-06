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

    // 1. Her durumda Query Params olarak ekle
    config.params = {
        lang,
        ...config.params,
    };

    const method = config.method?.toLowerCase();

    // 2. Body olan isteklerde (POST, PUT vb.) Body'ye de ekle
    if (method !== "get" && method !== "head") {
        if (config.data instanceof FormData) {
            config.data.append("lang", lang);
        } else {
            const currentData = typeof config.data === "string" ? JSON.parse(config.data || "{}") : (config.data || {});
            config.data = {
                ...currentData,
                lang
            };
        }
    }

    // Remove Content-Type if it's FormData (Browser sets it automatically with boundary)
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

export default apiClient;
