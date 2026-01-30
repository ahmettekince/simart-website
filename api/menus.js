import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Header menülerini getirir.
 * @returns {Promise<Array>} Menu items array'i
 */
export async function getMenus() {
    const response = await serverFetch("/menus", {
        method: "POST",
        next: { revalidate: 3600 }, // 1 saat cache
        body: { type: "header-menu" },
    });

    // API POST ile çalışıyor ve direkt menüleri döndürüyor
    if (response?.status === "success") {
        // API direkt menü array'ini döndürüyor
        if (Array.isArray(response.data)) {
            return response.data;
        }
        // Veya data.items içinde olabilir
        if (response.data?.items && Array.isArray(response.data.items)) {
            return response.data.items;
        }
    }

    log("[API menus.js] getMenus failed:", response);
    return [];
}

/**
 * Menu type'a göre menü getirir (footer menüleri için)
 * @param {string} menuType - Menu type (örn: "yardim", "hakkimizda")
 * @returns {Promise<Object|null>} Menu objesi veya null
 */
export async function getMenuByType(menuType) {
    if (!menuType) {
        log("[API menus.js] getMenuByType: menuType is required");
        return null;
    }

    const response = await serverFetch("/menus", {
        method: "POST",
        body: { type: menuType },
        next: { revalidate: 3600 }
    });

    if (response?.status === "success" && response.data) {
        return response.data;
    }

    log(`[API menus.js] getMenuByType(${menuType}) failed:`, response);
    return null;
}

/**
 * Footer menülerini getirir (Yardım ve Hakkımızda)
 * Slug'a göre dinamik olarak eşleştirir - API'den gelen slug değerine göre
 * @returns {Promise<Array>} Menu array'i (slug field'ı ile)
 */
export async function getFooterMenus() {
    const [yardimMenu, hakkimizdaMenu] = await Promise.all([
        getMenuByType("yardim"),
        getMenuByType("hakkimizda"),
    ]);

    // Menüleri array olarak döndür (slug field'ı ile birlikte)
    const menus = [];

    if (yardimMenu?.slug && yardimMenu?.items?.length > 0) {
        menus.push(yardimMenu);
    }

    if (hakkimizdaMenu?.slug && hakkimizdaMenu?.items?.length > 0) {
        menus.push(hakkimizdaMenu);
    }

    return menus;
}

