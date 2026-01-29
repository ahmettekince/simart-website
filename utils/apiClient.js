const baseURL = "/api/proxy";

async function request(method, url, data = null, config = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...config.headers,
    };

    // Clean up config to avoid passing axios-specific fields to fetch that might cause issues
    const { params, ...fetchConfig } = config;

    const options = {
        method,
        headers,
        ...fetchConfig,
    };

    // Body handling
    if (data) {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            // FormData handling:
            // 1. Don't stringify
            // 2. Remove Content-Type header to let browser set it with boundary
            options.body = data;
            if (headers["Content-Type"] === "application/json" || headers["Content-Type"] === "multipart/form-data") {
                delete headers["Content-Type"];
            }
        } else {
            // Default JSON handling
            options.body = JSON.stringify(data);
        }
    }

    // URL construction
    let finalUrl = `${baseURL}${url}`;

    // Query params handling (axios style: config.params)
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value);
            }
        });
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}${searchParams.toString()}`;
    }

    // credentials handling (Axios withCredentials: true equivalent)
    options.credentials = 'include';

    try {
        const response = await fetch(finalUrl, options);

        // Convert Headers to plain object (Axios compatibility)
        const responseHeaders = {};
        if (response.headers && response.headers.forEach) {
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });
        }

        // Response parsing
        let responseData = null;
        if (response.status !== 204) {
            const text = await response.text();
            if (text && text.trim().length > 0) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try {
                        responseData = JSON.parse(text);
                    } catch (e) {
                        // If JSON parse fails, return text
                        responseData = text;
                    }
                } else {
                    responseData = text;
                }
            }
        }

        // Axios mimics: throws on non-2xx
        if (!response.ok) {
            const error = new Error(`Request failed with status ${response.status}`);
            error.response = {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
            };
            throw error;
        }

        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            config: options,
        };
    } catch (error) {
        // Preserve stack trace but ensure response property exists if it was a network error
        if (!error.response) {
            // Network error or other fetch issue
            error.response = {
                data: null,
                status: 0,
                statusText: "Network Error",
            };
        }
        throw error;
    }
}

const apiClient = {
    get: (url, config) => request("GET", url, null, config),
    post: (url, data, config) => request("POST", url, data, config),
    put: (url, data, config) => request("PUT", url, data, config),
    delete: (url, config) => request("DELETE", url, null, config),
    patch: (url, data, config) => request("PATCH", url, data, config),
};

export default apiClient;
