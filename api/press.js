import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Basında Biz (Press) verilerini getirir.
 */
export async function getPress() {
    try {
        const response = await serverFetch("/press", {
            next: { revalidate: API_REVALIDATE.PRESS },
        });

        if (response?.status === "success" && Array.isArray(response.data)) {
            return response.data;
        }

        log("[API press.js] getPress failed:", response);
        return [];
    } catch (error) {
        log("[API press.js] getPress error:", error?.message);
        return [];
    }
}
