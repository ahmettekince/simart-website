import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api/proxy",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Cookie'leri otomatik gönder (client-side için gerekli)
});

// FormData gönderildiğinde Content-Type'ı kaldır (axios otomatik boundary ile set eder)
apiClient.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

export default apiClient;
