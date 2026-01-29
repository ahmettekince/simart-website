// Fetch API tabanlı API client (Axios yerine)
const BASE_URL = "/api/proxy";

// Query parametrelerini URL'e ekle
function buildUrl(url, params) {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    const urlObj = new URL(url, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            urlObj.searchParams.append(key, params[key]);
        }
    });

    // Relative URL için pathname + search döndür
    return urlObj.pathname + urlObj.search;
}

// Axios benzeri response wrapper
function createResponse(data, status, statusText, headers) {
    return {
        data,
        status,
        statusText,
        headers,
        // Axios uyumluluğu için
        config: {},
    };
}

// Axios benzeri error wrapper
function createError(message, response, status) {
    const error = new Error(message);
    error.response = response;
    error.status = status;
    return error;
}

// Ana request fonksiyonu
async function request(method, url, data = null, config = {}) {
    const fullUrl = buildUrl(`${BASE_URL}${url}`, config.params);

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...config.headers,
        },
        credentials: "include", // Cookie'leri otomatik gönder (withCredentials: true yerine)
    };

    // Body varsa ekle
    if (data !== null && data !== undefined) {
        if (data instanceof FormData) {
            // FormData ise Content-Type'ı kaldır (browser otomatik ekler)
            delete options.headers["Content-Type"];
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(fullUrl, options);

        // Response headers'ı parse et
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        // Response body'yi parse et
        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        // Axios benzeri response oluştur
        const axiosResponse = createResponse(
            responseData,
            response.status,
            response.statusText,
            responseHeaders
        );

        // HTTP hata kodları için error fırlat (Axios gibi)
        if (!response.ok) {
            throw createError(
                `Request failed with status code ${response.status}`,
                axiosResponse,
                response.status
            );
        }

        return axiosResponse;
    } catch (error) {
        // Fetch network hataları için
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw createError(
                "Network Error",
                {
                    data: { message: "Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin." },
                    status: 0,
                },
                0
            );
        }
        throw error;
    }
}

// Axios benzeri API client objesi
const apiClient = {
    get: (url, config = {}) => request("GET", url, null, config),
    post: (url, data = null, config = {}) => request("POST", url, data, config),
    put: (url, data = null, config = {}) => request("PUT", url, data, config),
    patch: (url, data = null, config = {}) => request("PATCH", url, data, config),
    delete: (url, config = {}) => request("DELETE", url, null, config),
};

export default apiClient;
