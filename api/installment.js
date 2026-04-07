import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

/**
 * Taksit seçeneklerini getirir (Client-side)
 * @param {string} slug - Ürün slug'ı
 * @returns {Promise<Object|null>} Taksit seçenekleri objesi veya null
 */
export async function getInstallmentOptions(slug) {
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
        log("[API installment.js] getInstallmentOptions: Geçersiz slug:", slug);
        return null;
    }

    try {
        const response = await apiClient.get(`/installment/options?slug=${encodeURIComponent(slug.trim())}`, {
            headers: {
                "X-Api-Lang": "tr",
            },
            validateStatus: (status) => status === 200 || status === 404,
        });

        if (response.status === 404) {
            log("[API installment.js] getInstallmentOptions: 404 - Taksit seçenekleri bulunamadı");
            return null;
        }

        if (response?.data?.success === true && Array.isArray(response.data.banks)) {
            log(`[API installment.js] getInstallmentOptions success: ${response.data.banks.length} banka`);
            return response.data;
        }

        log("[API installment.js] getInstallmentOptions failed:", response?.data);
        return null;
    } catch (error) {
        log("[API installment.js] getInstallmentOptions error:", {
            message: error.message,
            response: error.response?.data,
        });
        return null;
    }
}
