"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useReviewStore } from "@/stores/reviewStore";
import ReviewDashboardModal from "@/components/modals/ReviewDashboardModal";

const DASHBOARD_PATHS = ["/hesabim", "/siparislerim", "/adreslerim", "/kupon-kodlarim", "/paylas-simart", "/my-account-edit", "/my-account-orders-details"];

export default function ReviewDashboardBanner() {
  const pathname = usePathname();
  const reviewableProducts = useReviewStore((s) => s.reviewableProducts);
  const [modalOpen, setModalOpen] = useState(false);

  const isDashboard = DASHBOARD_PATHS.some((p) => pathname === p || pathname?.startsWith(p + "/"));

  if (!isDashboard || !reviewableProducts.length) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setModalOpen(true)}
        style={{
          marginBottom: "20px",
          padding: "14px 18px",
          backgroundColor: "#e8f5e9",
          border: "1px solid #c8e6c9",
          borderRadius: "10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "14px", color: "#2e7d32", fontWeight: 600 }}>
          Yorum yapabileceğiniz {reviewableProducts.length} adet ürün var. Yorum yapın, kupon fırsatı yakalayın!
        </span>
        <span style={{ fontSize: "13px", color: "#388e3c", textDecoration: "underline" }}>Yorum Yap →</span>
      </div>

      <ReviewDashboardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={reviewableProducts}
      />
    </>
  );
}
