import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Etkinliklerimiz (Events) verilerini getirir.
 */
export async function getEvents() {
    try {
        const response = await serverFetch("/events", {
            cache: "no-store",
        });

        if (response?.status === "success" && Array.isArray(response.data)) {
            return response.data;
        }

        log("[API events.js] getEvents failed:", response);
        return [];
    } catch (error) {
        log("[API events.js] getEvents error:", error?.message);
        return [];
    }
}
