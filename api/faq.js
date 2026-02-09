import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

/**
 * Mağaza kategorilerini getirir (mağaza sayfasında kullanılan /categories API).
 * @returns {Promise<Array>} Kategori listesi [{ id, name, slug, ... }]
 */
export async function getStoreCategories() {
  try {
    const response = await apiClient.get("/categories");
    if (response.data?.status === "success" && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    log("[API faq.js] getStoreCategories: beklenmeyen format", response.data);
    return [];
  } catch (error) {
    log("[API faq.js] getStoreCategories hatası:", error?.response?.data || error.message);
    return [];
  }
}

/**
 * Kategoriye ait ürünleri getirir.
 * @param {string} categorySlug - Kategori slug'ı
 * @returns {Promise<Array>} Ürün listesi
 */
export async function getProductsByCategory(categorySlug) {
  if (!categorySlug) return [];
  try {
    const response = await apiClient.get(`/products/category/${categorySlug}`);
    const products = response.data?.data ?? response.data?.products ?? [];
    return Array.isArray(products) ? products : [];
  } catch (error) {
    log("[API faq.js] getProductsByCategory hatası:", error?.response?.data || error.message);
    return [];
  }
}

/**
 * Ürün kategorisine ait SSS'leri getirir.
 * O kategorideki ürünlerin faq_data alanlarını toplar.
 * @param {string} categorySlug - Kategori slug'ı (örn: "robotlar")
 * @returns {Promise<Array>} FAQ listesi [{ title, content }, ...]
 */
export async function getFaqsByProductCategory(categorySlug) {
  if (!categorySlug) return [];
  try {
    const response = await apiClient.get(`/products/category/${categorySlug}`);
    const products = response.data?.data ?? response.data?.products ?? [];
    if (!Array.isArray(products)) return [];

    const faqs = [];
    const seen = new Set();
    for (const product of products) {
      const items = product?.faq_data || [];
      for (const item of items) {
        const title = item.title || item.question || "";
        const content = item.content || item.answer || "";
        if (!title) continue;
        const key = `${title}|${content}`;
        if (seen.has(key)) continue;
        seen.add(key);
        faqs.push({ title, content });
      }
    }
    return faqs;
  } catch (error) {
    log("[API faq.js] getFaqsByProductCategory hatası:", error?.response?.data || error.message);
    return [];
  }
}
