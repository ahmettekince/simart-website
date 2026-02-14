import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Basında Biz (Press) verilerini getirir.
 */
export async function getPress() {
    try {
        const response = await serverFetch("/press", {
            cache: "no-store",
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
