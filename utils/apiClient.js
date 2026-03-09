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
    config.headers["Accept-Language"] = lang;

    // Remove Content-Type if it's FormData
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

export default apiClient;
