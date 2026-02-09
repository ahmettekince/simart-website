import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";

/**
 * Kilometre taşları (timeline) verilerini getirir.
 * /timeline endpoint'inden dönen listeyi kullanır.
 */
export async function getTimeline() {
  try {
    const response = await serverFetch("/timeline", {
      cache: "no-store",
    });

    if (response?.status === "success" && Array.isArray(response.data)) {
      return response.data;
    }

    log("[API timeline.js] getTimeline failed:", response);
    return [];
  } catch (error) {
    log("[API timeline.js] getTimeline error:", error?.message);
    return [];
  }
}
