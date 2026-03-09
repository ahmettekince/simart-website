import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Header menülerini getirir.
 * @returns {Promise<Array>} Menu items array'i
 */
export async function getMenus(lang = "tr") {
    const data = await getMenuByType("header-menu", lang);

    if (data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data.items && Array.isArray(data.items)) {
            return data.items;
        }
    }

    return [];
}

/**
 * Menu type'a göre menü getirir (footer menüleri için)
 * @param {string} menuType - Menu type (örn: "yardim", "hakkimizda")
 * @param {string} lang - Dil kodu
 * @returns {Promise<Object|null>} Menu objesi veya null
 */
export async function getMenuByType(menuType, lang = "tr") {
    if (!menuType) {
        log("[API menus.js] getMenuByType: menuType is required");
        return null;
    }

    const response = await serverFetch("/menus", {
        method: "POST",
        body: { type: menuType },
        lang, // Arka plana iletiliyor
        next: { revalidate: API_REVALIDATE.MENUS }
    });

    if (response?.status === "success" && response.data) {
        return response.data;
    }

    log(`[API menus.js] getMenuByType(${menuType}) failed:`, response);
    return null;
}

/**
 * Footer menülerini getirir (Yardım ve Hakkımızda)
 * @returns {Promise<Array>} Menu array'i (slug field'ı ile)
 */
export async function getFooterMenus(lang = "tr") {
    const [yardimMenu, hakkimizdaMenu] = await Promise.all([
        getMenuByType("yardim", lang),
        getMenuByType("hakkimizda", lang),
    ]);

    const menus = [];

    if (yardimMenu?.slug && yardimMenu?.items?.length > 0) {
        menus.push(yardimMenu);
    }

    if (hakkimizdaMenu?.slug && hakkimizdaMenu?.items?.length > 0) {
        menus.push(hakkimizdaMenu);
    }

    return menus;
}

