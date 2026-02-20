import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Belirli bir slug'a göre QR kart bilgilerini getirir.
 * @param {string} slug - QR kartın benzersiz slug değeri
 * @returns {Promise<Object|null>} QR kart verisi veya null
 */
export async function getQrCard(slug) {
    if (!slug) return null;

    log(`[API qr.js] getQrCard: İstek gönderiliyor - URL: /qr-cards/${slug}`);

    try {
        const response = await serverFetch(`/qr-cards/${slug}`, {
            cache: "no-store"
        });

        if (response?.status === "success") {
            log(`[API qr.js] getQrCard success: ${slug} yüklendi`);
            return response.data;
        }

        log("[API qr.js] getQrCard failed:", response);
        return null;
    } catch (error) {
        log("[API qr.js] getQrCard exception:", error.message);
        return null;
    }
}
