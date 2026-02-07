import { create } from "zustand";

/**
 * Yorum yapılabilecek ürünler (dashboard sayfalarında kullanılır).
 * GET /customer/reviewable-products ile doldurulur.
 */
export const useReviewStore = create((set, get) => ({
  reviewableProducts: [],
  lastFetchedAt: null,

  setReviewableProducts: (products) => {
    set({
      reviewableProducts: Array.isArray(products) ? products : [],
      lastFetchedAt: Date.now(),
    });
  },

  removeReviewableProduct: (productId) => {
    set((state) => ({
      reviewableProducts: state.reviewableProducts.filter((p) => p.id !== productId),
    }));
  },

  clearReviewableProducts: () => {
    set({ reviewableProducts: [], lastFetchedAt: null });
  },
}));
