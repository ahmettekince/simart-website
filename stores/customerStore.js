import { create } from "zustand";
import apiClient from "@/utils/apiClient";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 saat

export const useCustomerStore = create((set, get) => ({
  customer: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  /** Müşteri verisini API'den çek. Zaten varsa ve 1 saat geçmemişse atla (force=true hariç). */
  fetchCustomer: async (force = false) => {
    const { customer, lastFetchedAt } = get();
    const now = Date.now();
    if (!force && customer && lastFetchedAt && now - lastFetchedAt < REFRESH_INTERVAL_MS) {
      return customer;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/customer/me");
      const data = response.data?.data?.customer || null;
      console.log("customer", data);
      set({ customer: data, lastFetchedAt: now, isLoading: false, error: null });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "";
      if (errorMsg.includes("device_id")) {
        // device_id hatası gelirse oturumu geçersiz say ve yönlendir
        set({ customer: null, isLoading: false, error: err });
        if (typeof window !== "undefined") {
          window.location.href = "/giris-yap";
        }
      } else {
        set({ error: err, isLoading: false });
      }
      return null;
    }
  },

  /** Telefon doğrulandıktan sonra state güncelle */
  refreshAfterPhoneVerify: () => {
    return get().fetchCustomer(true);
  },

  /** Cache temizle (logout vb.) */
  clear: () => {
    set({ customer: null, lastFetchedAt: null, error: null });
  },
}));
