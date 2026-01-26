import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Tüm kategorileri getirir.
 */
export async function getCategories() {
    log("[API home.js] getCategories: İstek gönderiliyor - URL: /categories");

    const response = await serverFetch("/categories", {
        next: { revalidate: 0 }, // Cache'i devre dışı bırak
        cache: "no-store" // Cache'i tamamen devre dweışı bırak
    });

    if (response?.status === "success") {
        const categories = response.data || [];

        return categories;
    }

    return [];
}

/**
 * Anasayfa slider bannerlarını getirir.
 * Cloudflare challenge sorunları için özel retry ayarları kullanılır.
 */
export async function getBanners() {
    try {
        // Banner için retry
        const response = await serverFetch("/banners?type=slider", {
            cache: "no-store",
            retries: 2, // Banner için 2 retry
        });

        // serverFetch hata durumunda null döndürür
        if (!response) {
            log("[API home.js] getBanners: API response is null (serverFetch returned null)");
            return [];
        }

        if (response?.status === "success") {
            const banners = response.data || [];
            if (banners.length > 0) {
                log(`[API home.js] getBanners success: ${banners.length} banner(s) loaded`);
            }
            return banners;
        }

        // API'den error response geldi
        log("[API home.js] getBanners failed:", {
            status: response?.status,
            message: response?.message,
            hasData: !!response?.data,
            response: response,
        });
        return [];
    } catch (error) {
        log("[API home.js] getBanners exception:", {
            message: error.message,
            stack: error.stack,
        });
        return [];
    }
}

/**
 * Collection banner'ı getirir.
 * @returns {Promise<Object|null>} Collection banner objesi veya null
 */
export async function getCollectionBanner() {
    try {
        const response = await serverFetch("/banners?type=collectionbanner", {
            next: { revalidate: 0 }
        });

        // serverFetch hata durumunda null döndürür
        if (!response) {
            log("[API home.js] getCollectionBanner: API response is null (serverFetch returned null)");
            return null;
        }

        if (response?.status === "success" && response.data) {
            // API'den dizi gelirse ilk elemanı, obje gelirse direkt döndür
            const banner = Array.isArray(response.data) ? response.data[0] : response.data;
            if (banner) {
                log(`[API home.js] getCollectionBanner success`);
                return banner;
            }
        }

        // API'den error response geldi
        log("[API home.js] getCollectionBanner failed:", {
            status: response?.status,
            message: response?.message,
            hasData: !!response?.data,
            response: response,
        });
        return null;
    } catch (error) {
        log("[API home.js] getCollectionBanner exception:", {
            message: error.message,
            stack: error.stack,
        });
        return null;
    }
}

/**
 * Collections listesini getirir (birden fazla collection banner).
 * @returns {Promise<Array>} Collections array'i
 */
export async function getCollections() {
    try {
        const response = await serverFetch("/banners?type=collections", {
            next: { revalidate: 0 }
        });

        // serverFetch hata durumunda null döndürür
        if (!response) {
            log("[API home.js] getCollections: API response is null (serverFetch returned null)");
            return [];
        }

        if (response?.status === "success") {
            const collections = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
            if (collections.length > 0) {
                log(`[API home.js] getCollections success: ${collections.length} collection(s) loaded`);
            }
            return collections;
        }

        // API'den error response geldi
        log("[API home.js] getCollections failed:", {
            status: response?.status,
            message: response?.message,
            hasData: !!response?.data,
            response: response,
        });
        return [];
    } catch (error) {
        log("[API home.js] getCollections exception:", {
            message: error.message,
            stack: error.stack,
        });
        return [];
    }
}

/**
 * Topbar verilerini getirir.
 * @returns {Promise<Object>} { data: Array, isActive: boolean }
 */
export async function getTopbar() {
    const response = await serverFetch("/topbars", {
        next: { revalidate: 10 }
    });

    if (response?.status === "success") {
        const data = response.data || [];
        const isActive = !!response.is_active;

        if (isActive && data.length > 0) {
            log(`[API home.js] getTopbar success: ${data.length} topbar item(s) loaded`);
        }

        return {
            data,
            isActive
        };
    }

    log("[API home.js] getTopbar failed:", response);
    return {
        data: [],
        isActive: false
    };
}
