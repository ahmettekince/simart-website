import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Tüm özel sayfaları getirir (admin panelden eklenen sayfalar)
 * @returns {Promise<Array>} Pages array'i
 */
export async function getPages() {
    const response = await serverFetch("/pages", {
        method: "POST",
        next: { revalidate: API_REVALIDATE.PAGES }
    });

    if (response?.status === "success") {
        return response.data || [];
    }

    log("[API pages.js] getPages failed:", response);
    return [];
}

/**
 * Slug'a göre tek bir sayfa getirir.
 * @param {string} slug - Sayfa slug'ı
 * @param {string} lang - Dil kodu
 * @returns {Promise<Object|null>} Page objesi veya null
 */
export async function getPageBySlug(slug, lang = "tr") {
    if (!slug) return null;

    const response = await serverFetch(`/pages?slug=${slug}`, {
        method: "POST",
        lang,
        next: { revalidate: API_REVALIDATE.PAGES }
    });

    if (response?.status === "success" && response.data) {
        return Array.isArray(response.data) ? response.data[0] : response.data;
    }

    log(`[API pages.js] getPageBySlug(${slug}, ${lang}) failed:`, response);
    return null;
}

/**
 * Tüm sayfa slug'larını getirir (blog route'u için kontrol)
 * @returns {Promise<Array<string>>} Slug array'i
 */
export async function getPageSlugs() {
    const pages = await getPages();
    return pages.map(page => page.slug).filter(Boolean);
}

