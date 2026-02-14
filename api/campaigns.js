import { serverFetch } from "@/utils/serverFetch";
import { log } from "@/utils/logger";
import { API_REVALIDATE } from "@/config/apiConfig";

/**
 * Kampanyaları getirir.
 * @returns {Promise<Array>} regular_campaigns dizisi
 */
export async function getCampaigns() {
  try {
    const response = await serverFetch("/campaigns", {
      next: { revalidate: API_REVALIDATE.CAMPAIGNS },
    });

    if (response?.status === "success" && response?.data) {
      const campaigns = response.data.regular_campaigns || [];
      if (campaigns.length > 0) {
        log(`[API campaigns.js] getCampaigns success: ${campaigns.length} campaign(s) loaded`);
      }
      return Array.isArray(campaigns) ? campaigns : [];
    }

    log("[API campaigns.js] getCampaigns failed:", response);
    return [];
  } catch (error) {
    log("[API campaigns.js] getCampaigns exception:", error);
    return [];
  }
}
