import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";
import { ProductModel } from "@/models/Product";

/**
 * Tüm ürünleri veya belirli filtredeki ürünleri getirir.
 */
export async function getProducts(params = "", lang = "tr") {
    const endpoint = `/products${params ? `?${params}` : ""}`;
    const response = await serverFetch(endpoint, { 
        method: "POST",
        lang, 
        next: { revalidate: API_REVALIDATE.PRODUCTS } 
    });

    if (response?.status === "success") {
        return response.data || [];
    }

    if (response) {
        log(response.data);
    }
    log("[API products.js] getProducts failed:", response);
    return [];
}

/**
 * Belirli bir kategoriye ait ürünleri getirir.
 * @param {string} categorySlug - Kategori slug'ı (örn: "robotlar")
 * @returns {Promise<Array>} Ürün listesi
 */
export async function getProductsByCategory(categorySlug, lang = "tr") {
    if (!categorySlug) {
        log("[API products.js] getProductsByCategory: categorySlug is required");
        return [];
    }

    const endpoint = `/products/category/${categorySlug}`;
    const response = await serverFetch(endpoint, { 
        method: "POST",
        lang, 
        next: { revalidate: API_REVALIDATE.PRODUCTS } 
    });

    if (response?.status === "success") {
        return response.data || [];
    }

    log("[API products.js] getProductsByCategory failed:", response);
    return [];
}

/**
 * Kategori bilgisi ve ürünlerini getirir. API'den category objesi döner.
 * @param {string} categorySlug - Kategori slug'ı
 * @returns {Promise<{products: Array, category: {name, slug, product_count, seo_keywords, seo_description}|null}>}
 */
export async function getCategoryWithProducts(categorySlug, lang = "tr") {
    if (!categorySlug) {
        log("[API products.js] getCategoryWithProducts: categorySlug is required");
        return { products: [], category: null };
    }

    const endpoint = `/products/category/${categorySlug}`;
    const response = await serverFetch(endpoint, { 
        method: "POST",
        lang, 
        next: { revalidate: API_REVALIDATE.PRODUCTS } 
    });

    if (response?.status === "success") {
        return {
            products: response.data || [],
            category: response.category || null,
        };
    }

    log("[API products.js] getCategoryWithProducts failed:", response);
    return { products: [], category: null };
}

/**
 * Slug'a göre tek bir ürün getirir ve normalize eder.
 * @param {string} productSlug - Ürün slug'ı
 * @returns {Promise<Product|null>} Normalize edilmiş ürün objesi veya null
 */
export async function getProductBySlug(productSlug, lang = "tr") {
    if (!productSlug) {
        log("[API products.js] getProductBySlug: productSlug is required");
        return null;
    }

    const endpoint = `/products/${productSlug}`;
    const response = await serverFetch(endpoint, { 
        method: "POST",
        lang, 
        next: { revalidate: API_REVALIDATE.PRODUCTS } 
    });

    if (response?.status === "success" && response.data) {
        try {
            // API'den gelen veriyi normalize et
            return ProductModel.normalize(response.data);
        } catch (error) {
            log("[API products.js] getProductBySlug normalization error:", error);
            // Normalize hatası olsa bile ham veriyi döndür
            return response.data;
        }
    }

    log("[API products.js] getProductBySlug failed:", response);
    return null;
}
