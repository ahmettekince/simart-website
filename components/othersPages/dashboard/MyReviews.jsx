"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { useReviewStore } from "@/stores/reviewStore";
import ReviewDashboardModal from "@/components/modals/ReviewDashboardModal";

const ACCENT_COLOR = "#3c81b5";

const PRODUCT_FILTERS = [
  { id: "degerlendir", label: "Değerlendir" },
  { id: "onaylanan", label: "Onaylanan" },
  { id: "bekleyen", label: "Bekleyen" },

];

function formatReviewDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function MyReviews() {
  const [activeFilter, setActiveFilter] = useState("degerlendir");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const reviewableProducts = useReviewStore((s) => s.reviewableProducts);
  const lastFetchedAt = useReviewStore((s) => s.lastFetchedAt);

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

  const products = activeFilter === "degerlendir" ? reviewableProducts : [];
  const hasProducts = products.length > 0;
  const loading = activeFilter === "degerlendir" && lastFetchedAt === null;

  const bekleyenReviews = myReviews.filter((r) => r.is_approved === false);
  const onaylananReviews = myReviews.filter((r) => r.is_approved === true);
  const filteredReviews =
    activeFilter === "bekleyen" ? bekleyenReviews : activeFilter === "onaylanan" ? onaylananReviews : [];
  const hasReviews = filteredReviews.length > 0;

  return (
    <div className="my-account-content account-reviews">
      <div className="wrap-account-reviews">
        {/* Filter buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
          {PRODUCT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: `2px solid ${activeFilter === f.id ? ACCENT_COLOR : "#e5e5e5"}`,
                background: "#fff",
                color: activeFilter === f.id ? ACCENT_COLOR : "#666",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f.label}
              {f.id === "degerlendir" && reviewableProducts.length > 0 && (
                <span> ({reviewableProducts.length})</span>
              )}
              {f.id === "bekleyen" && bekleyenReviews.length > 0 && (
                <span> ({bekleyenReviews.length})</span>
              )}
              {f.id === "onaylanan" && onaylananReviews.length > 0 && (
                <span> ({onaylananReviews.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#666" }}>Yükleniyor...</p>
          </div>
        ) : reviewsLoading && (activeFilter === "bekleyen" || activeFilter === "onaylanan") ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#666" }}>Yorumlarınız yükleniyor...</p>
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
                      <div style={{ fontSize: "12px", color: "#666" }}>Sipariş: {p.order_number}</div>
                    )}
                  </div>
                </div>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e5e5" }}>
                  <button
                    type="button"
                    onClick={() => handleReviewClick(p)}
                    className="tf-btn btn-fill animate-hover-btn"
                    style={{ width: "100%", backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, fontSize: "14px" }}
                  >
                    Ürünü Değerlendir
                  </button>
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
                      href={`/magaza/${review.product?.category_slug || "urunler"}/${review.product?.slug || review.product?.id}`}
                      style={{ fontWeight: 600, fontSize: "15px", color: "#111", textDecoration: "none" }}
                    >
                      {review.product?.name || "Ürün"}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                      <span style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= (review.rating || 0) ? "#FFC107" : "#ddd", fontSize: "14px" }}>★</span>
                        ))}
                      </span>
                      <span style={{ fontSize: "12px", color: "#888" }}>{formatReviewDate(review.created_at)}</span>
                      {activeFilter === "bekleyen" && (
                        <span style={{ fontSize: "11px", color: "#f59e0b", backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "4px" }}>
                          İncelemede
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
                backgroundColor: `${ACCENT_COLOR}15`,
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={ACCENT_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p style={{ fontSize: "18px", fontWeight: 600, color: ACCENT_COLOR, marginBottom: "24px" }}>
              {activeFilter === "degerlendir"
                ? "Ürün Değerlendirmeniz Bulunmamaktadır."
                : activeFilter === "bekleyen"
                  ? "Bekleyen yorumunuz bulunmamaktadır."
                  : activeFilter === "onaylanan"
                    ? "Onaylanan yorumunuz bulunmamaktadır."
                    : "Bu filtrede değerlendirme bulunamadı."}
            </p>
            {activeFilter === "degerlendir" && (
              <Link
                href="/magaza"
                className="tf-btn btn-fill animate-hover-btn radius-4"
                style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
              >
                Alışverişe Devam Et
              </Link>
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
    </div>
  );
}
