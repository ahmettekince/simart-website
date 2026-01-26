import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api/proxy",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Cookie'leri otomatik gönder (client-side için gerekli)
});

export default apiClient;
