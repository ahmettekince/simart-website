import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Sertifikalar (Certificates) verilerini getirir.
 */
export async function getCertificates(lang = "tr") {
    try {
        const response = await serverFetch("/certificates", {
            lang,
            next: { revalidate: API_REVALIDATE.CERTIFICATES },
        });

        if (response?.status === "success" && Array.isArray(response.data)) {
            return response.data;
        }

        log("[API certificates.js] getCertificates failed:", response);
        return [];
    } catch (error) {
        log("[API certificates.js] getCertificates error:", error?.message);
        return [];
    }
}
