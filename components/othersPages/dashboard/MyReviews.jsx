"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { useReviewStore } from "@/stores/reviewStore";
import ReviewDashboardModal from "@/components/modals/ReviewDashboardModal";
import AccountTabs from "@/components/common/AccountTabs";
import SimartButton from "@/components/common/SimartButton";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

function formatReviewDate(iso, lang = "tr") {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "en" ? "en-US" : "tr-TR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  } catch {
    return iso;
  }
}

export default function MyReviews() {
  const lang = useLangStore((s) => s.lang);
  const [activeFilter, setActiveFilter] = useState("degerlendir");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const reviewableProducts = useReviewStore((s) => s.reviewableProducts);
  const lastFetchedAt = useReviewStore((s) => s.lastFetchedAt);

  const t = {
    tr: {
      tabEvaluate: "Değerlendir",
      tabApproved: "Onaylanan",
      tabPending: "Bekleyen",
      loading: "Yükleniyor...",
      loadingReviews: "Yorumlarınız yükleniyor...",
      order: "Sipariş",
      evaluateProduct: "Ürünü Değerlendir",
      product: "Ürün",
      inReview: "İncelemede",
      emptyNoEvaluation: "Ürün Değerlendirmeniz Bulunmamaktadır.",
      emptyNoPending: "Bekleyen yorumunuz bulunmamaktadır.",
      emptyNoApproved: "Onaylanan yorumunuz bulunmamaktadır.",
      emptyNoResult: "Bu filtrede değerlendirme bulunamadı.",
      continueShopping: "Alışverişe Devam Et"
    },
    en: {
      tabEvaluate: "To Review",
      tabApproved: "Approved",
      tabPending: "Pending",
      loading: "Loading...",
      loadingReviews: "Loading your reviews...",
      order: "Order",
      evaluateProduct: "Evaluate Product",
      product: "Product",
      inReview: "In Review",
      emptyNoEvaluation: "You have no products to review.",
      emptyNoPending: "You have no pending reviews.",
      emptyNoApproved: "You have no approved reviews.",
      emptyNoResult: "No evaluations found for this filter.",
      continueShopping: "Continue Shopping"
    }
  }[lang] || {};

  const fetchMyReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await apiClient.get("/customer/reviews");
      const list = res.data?.data?.data ?? res.data?.data ?? [];
      setMyReviews(Array.isArray(list) ? list : []);
    } catch {
      setMyReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const handleReviewClick = (product) => {
    setModalProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalProduct(null);
  };

  const handleReviewSuccess = () => {
    fetchMyReviews();
  };

  const products = activeFilter === "degerlendir" ? reviewableProducts : [];
  const hasProducts = products.length > 0;
  const loading = activeFilter === "degerlendir" && lastFetchedAt === null;

  const bekleyenReviews = myReviews.filter((r) => r.is_approved === false);
  const onaylananReviews = myReviews.filter((r) => r.is_approved === true);
  const filteredReviews =
    activeFilter === "bekleyen" ? bekleyenReviews : activeFilter === "onaylanan" ? onaylananReviews : [];
  const hasReviews = filteredReviews.length > 0;

  const reviewTabs = useMemo(
    () => [
      { id: "degerlendir", label: t.tabEvaluate, count: reviewableProducts.length },
      { id: "onaylanan", label: t.tabApproved, count: onaylananReviews.length },
      { id: "bekleyen", label: t.tabPending, count: bekleyenReviews.length },
    ],
    [reviewableProducts.length, onaylananReviews.length, bekleyenReviews.length, t.tabEvaluate, t.tabApproved, t.tabPending]
  );

  return (
    <div className="my-account-content account-reviews">
      <div className="wrap-account-reviews">
        <AccountTabs tabs={reviewTabs} activeTab={activeFilter} onTabChange={setActiveFilter} />

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#666" }}>{t.loading}</p>
          </div>
        ) : reviewsLoading && (activeFilter === "bekleyen" || activeFilter === "onaylanan") ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#666" }}>{t.loadingReviews}</p>
          </div>
        ) : activeFilter === "degerlendir" && hasProducts ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", gap: "12px", padding: "16px", flex: 1 }}>
                  {(p.cover_image?.thumbnail_url || p.cover_image?.url) && (
                    <Image
                      src={p.cover_image.thumbnail_url || p.cover_image.url}
                      alt=""
                      width={80}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", lineHeight: 1.3, marginBottom: "6px" }}>{p.name}</div>
                    {p.order_number && (
                      <div style={{ fontSize: "12px", color: "#666" }}>{t.order}: {p.order_number}</div>
                    )}
                  </div>
                </div>
                <div style={{ padding: "0 16px 12px 16px" }}>
                  <SimartButton
                    type="button"
                    onClick={() => handleReviewClick(p)}
                    fullWidth
                  >
                    {t.evaluateProduct}
                  </SimartButton>
                </div>
              </div>
            ))}
          </div>
        ) : (activeFilter === "bekleyen" || activeFilter === "onaylanan") && hasReviews ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <Link
                      href={getLocalizedUrl(`/magaza/${review.product?.category_slug || "urunler"}/${review.product?.slug || review.product?.id}`, lang)}
                      style={{ fontWeight: 600, fontSize: "15px", color: "#111", textDecoration: "none" }}
                    >
                      {review.product?.name || t.product}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                      <span style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= (review.rating || 0) ? "#FFC107" : "#ddd", fontSize: "14px" }}>★</span>
                        ))}
                      </span>
                      <span style={{ fontSize: "12px", color: "#888" }}>{formatReviewDate(review.created_at, lang)}</span>
                      {activeFilter === "bekleyen" && (
                        <span style={{ fontSize: "11px", color: "#f59e0b", backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "4px" }}>
                          {t.inReview}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "14px", color: "#444", marginTop: "10px", lineHeight: 1.5 }}>{review.comment}</p>
                    {Array.isArray(review.images) && review.images.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                        {review.images.map((img) => (
                          <Link
                            key={img.id}
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "block" }}
                          >
                            <Image
                              src={img.thumbnail_url || img.url}
                              alt=""
                              width={64}
                              height={64}
                              style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "rgba(60, 129, 181, 0.08)",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #3c81b5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--primary, #3c81b5)", marginBottom: "24px" }}>
              {activeFilter === "degerlendir"
                ? t.emptyNoEvaluation
                : activeFilter === "bekleyen"
                  ? t.emptyNoPending
                  : activeFilter === "onaylanan"
                    ? t.emptyNoApproved
                    : t.emptyNoResult}
            </p>
            {activeFilter === "degerlendir" && (
              <SimartButton
                href={getLocalizedUrl("/magaza", lang)}
                style={{ width: "auto", minWidth: "200px" }}
              >
                {t.continueShopping}
              </SimartButton>
            )}
          </div>
        )}
      </div>

      <ReviewDashboardModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleReviewSuccess}
        products={modalProduct ? [modalProduct] : []}
      />
      <style jsx global>{`
        .account-reviews .main-cart-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--primary);
          background: var(--primary);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .account-reviews .main-cart-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
