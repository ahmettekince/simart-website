import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Sertifikalar (Certificates) verilerini getirir.
 */
export async function getCertificates() {
    try {
        const response = await serverFetch("/certificates", {
            cache: "no-store",
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
