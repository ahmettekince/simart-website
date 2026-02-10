import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

export async function getPopups() {
  try {
    const res = await apiClient.get("/popup");
    log("[Popup API] Ham yanıt:", res?.data);
    if (res.data?.status === "success" && Array.isArray(res.data?.data)) {
      log("[Popup API] Başarılı,", res.data.data.length, "adet döndü");
      return res.data.data;
    }
    log("[Popup API] Geçersiz format veya boş");
    return [];
  } catch (e) {
    log("[Popup API] İstek hatası:", e);
    return [];
  }
}
