import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Kilometre taşları (timeline) verilerini getirir.
 * /timeline endpoint'inden dönen listeyi kullanır.
 */
export async function getTimeline(lang = "tr") {
  try {
    const response = await serverFetch("/timeline", {
      lang,
      next: { revalidate: API_REVALIDATE.TIMELINE },
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
