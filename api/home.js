import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Tüm kategorileri getirir.
 */
export async function getCategories(lang = "tr") {
    log("[API home.js] getCategories: İstek gönderiliyor - URL: /categories");

    const response = await serverFetch("/categories", {
        method: "GET",
        lang,
        next: { revalidate: API_REVALIDATE.HOME },
        cache: "no-store"
    });

    if (response?.status === "success") {
        const categories = response.data || [];

        return categories;
    }

    return [];
}

/**
 * Anasayfa slider bannerlarını getirir.
 */
export async function getBanners(lang = "tr") {
    try {
        const response = await serverFetch("/banners", {
            method: "POST",
            body: { type: "slider" },
            lang,
            cache: "no-store",
            retries: 2,
        });

        if (response?.status === "success" && response.data) {
            // Veri yapısı kontrolü: Array olması şart
            if (Array.isArray(response.data)) {
                return response.data;
            }
            // Eğer objeyse içindeki banner dizisini bulmayı dene
            if (response.data.banners && Array.isArray(response.data.banners)) {
                return response.data.banners;
            }
            if (response.data.items && Array.isArray(response.data.items)) {
                return response.data.items;
            }
        }
        return [];
    } catch (error) {
        log("[API home.js] getBanners exception:", error.message);
        return [];
    }
}

/**
 * Collection banner'ı getirir.
 */
export async function getCollectionBanner(lang = "tr") {
    try {
        const response = await serverFetch("/banners", {
            method: "POST",
            body: { type: "collectionbanner" },
            lang,
            next: { revalidate: API_REVALIDATE.HOME }
        });

        if (!response) return null;

        if (response?.status === "success" && response.data) {
            const banner = Array.isArray(response.data) ? response.data[0] : response.data;
            return banner;
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Collections listesini getirir.
 */
export async function getCollections(lang = "tr") {
    try {
        const response = await serverFetch("/banners", {
            method: "POST",
            body: { type: "collections" },
            lang,
            next: { revalidate: API_REVALIDATE.HOME }
        });

        if (response?.status === "success" && response.data) {
            const data = response.data;
            return Array.isArray(data) ? data : (data.items && Array.isArray(data.items) ? data.items : [data]);
        }
        return [];
    } catch (error) {
        return [];
    }
}

/**
 * Anasayfa için yorumları getirir.
 */
export async function getReviews(lang = "tr") {
    try {
        const response = await serverFetch("/reviews", {
            method: "GET",
            lang,
            next: { revalidate: API_REVALIDATE.REVIEWS }
        });

        if (!response) return [];

        if (response?.status === "success") {
            return response.data?.reviews || [];
        }
        return [];
    } catch (error) {
        return [];
    }
}

/**
 * Topbar verilerini getirir.
 */
export async function getTopbar(lang = "tr") {
    const response = await serverFetch("/topbars", {
        method: "POST",
        body: { type: "info" },
        lang,
        next: { revalidate: API_REVALIDATE.TOPBAR }
    });

    if (response?.status === "success") {
        return {
            data: response.data || [],
            isActive: !!response.is_active || response.data?.length > 0
        };
    }

    return { data: [], isActive: false };
}
