import apiClient from "@/utils/apiClient";

export async function getPopups() {
  try {
    const res = await apiClient.get("/popup");
    console.log("[Popup API] Ham yanıt:", res?.data);
    if (res.data?.status === "success" && Array.isArray(res.data?.data)) {
      console.log("[Popup API] Başarılı,", res.data.data.length, "adet döndü");
      return res.data.data;
    }
    console.log("[Popup API] Geçersiz format veya boş");
    return [];
  } catch (e) {
    console.error("[Popup API] İstek hatası:", e);
    return [];
  }
}
