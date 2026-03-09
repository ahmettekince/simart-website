import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Tüm kategorileri getirir.
 */
export async function getCategories(lang = "tr") {
    log("[API home.js] getCategories: İstek gönderiliyor - URL: /categories");

    const response = await serverFetch("/categories", {
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

        if (!response) {
            log("[API home.js] getBanners: API response is null");
            return [];
        }

        if (response?.status === "success") {
            const banners = response.data || [];
            return banners;
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

        if (!response) return [];

        if (response?.status === "success") {
            return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
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
        lang,
        next: { revalidate: API_REVALIDATE.TOPBAR }
    });

    if (response?.status === "success") {
        return {
            data: response.data || [],
            isActive: !!response.is_active
        };
    }

    return { data: [], isActive: false };
}
