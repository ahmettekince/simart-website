"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useCustomerStore } from "@/stores/customerStore";
import AccountProfileSection from "@/components/othersPages/dashboard/AccountProfileSection";
import ReviewDashboardModal from "@/components/modals/ReviewDashboardModal";

import { getLocalizedUrl } from "@/utils/i18n";
import { useLangStore } from "@/stores/langStore";

export default function DashboardNav({ profileSection: profileSectionProp }) {
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const clearCustomer = useCustomerStore((s) => s.clear);
  const reviewableProducts = useReviewStore((s) => s.reviewableProducts);
  const setReviewableProducts = useReviewStore((s) => s.setReviewableProducts);
  const fetchCustomer = useCustomerStore((s) => s.fetchCustomer);

  const translations = {
    tr: {
      account: "Hesabım",
      orders: "Siparişlerim",
      reviews: "Değerlendirmelerim",
      addresses: "Adreslerim",
      coupons: "Kupon Kodlarım",
      share: "Paylaş Şımart",
      logout: "Çıkış Yap",
      loggingOut: "Çıkış yapılıyor...",
      logoutConfirm: "Çıkış yapmak istiyor musunuz?",
      yesLogout: "Evet, Çıkış Yap",
      cancel: "Vazgeç",
      reviewNotification: (count) => `Yorum yapabileceğiniz ${count} adet ürün var. Yorum yapın, kupon fırsatı yakalayın!`
    },
    en: {
      account: "My Account",
      orders: "My Orders",
      reviews: "My Reviews",
      addresses: "My Addresses",
      coupons: "My Coupons",
      share: "Share Şımart",
      logout: "Logout",
      loggingOut: "Logging out...",
      logoutConfirm: "Are you sure you want to log out?",
      yesLogout: "Yes, Log Out",
      cancel: "Cancel",
      reviewNotification: (count) => `You have ${count} products to review. Review now to get coupons!`
    }
  };

  const t = translations[lang] || translations.tr;

  const accountLinks = [
    { href: "/hesabim", label: t.account },
    { href: "/siparislerim", label: t.orders },
    { href: "/degerlendirmelerim", label: t.reviews, showCount: true },
    { href: "/adreslerim", label: t.addresses },
    { href: "/kupon-kodlarim", label: t.coupons },
    { href: "/paylas-simart", label: t.share },
  ];

  // Hesap sayfasına girildiğinde 1 kerelik customer verisi çek, saatte 1 güncelle
  useEffect(() => {
    fetchCustomer();
    const interval = setInterval(() => fetchCustomer(), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCustomer]);

  const profileSection = profileSectionProp ?? <AccountProfileSection />;

  const fetchReviewableProducts = useCallback(async () => {
    try {
      const res = await apiClient.get("/customer/reviewable-products");
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : [];
      setReviewableProducts(list);
    } catch {
      setReviewableProducts([]);
    }
  }, [setReviewableProducts]);

  useEffect(() => {
    fetchReviewableProducts();
    const interval = setInterval(fetchReviewableProducts, 60000);
    return () => clearInterval(interval);
  }, [fetchReviewableProducts]);

  const doLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await apiClient.post("/customer/logout");
      if (response.data?.status === "success" || response.status === 200) {
        clearCustomer();
        logout();
        document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = getLocalizedUrl("/giris-yap", lang);
        return;
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = getLocalizedUrl("/giris-yap", lang);
      return;
    }
    setIsLoggingOut(false);
  };

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  return (
    <>
      <div className="dashboard-sidebar-sticky">
        <ul className="my-account-nav">
          {reviewableProducts.length > 0 && (
            <li key="notification">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="my-account-nav-item"
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  font: "inherit",
                  color: "inherit",
                  backgroundColor: "transparent",
                }}
              >
                <span className="bell-notification-icon" style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
                <span style={{ flex: 1, lineHeight: 1.3, color: "#0bc15c" }}>
                  {t.reviewNotification(reviewableProducts.length)}
                </span>
              </button>
            </li>
          )}
          {profileSection && (
            <li key="profile" className="dashboard-nav-profile-slot" style={{ listStyle: "none", margin: 0, padding: 0, border: "none", background: "none" }}>
              {profileSection}
            </li>
          )}
          {accountLinks.map((link, index) => {
            const localizedHref = getLocalizedUrl(link.href, lang);
            const isActive = pathname === localizedHref || (lang === "tr" && pathname === link.href);

            return (
              <li key={index}>
                <Link
                  href={localizedHref}
                  className={`my-account-nav-item ${isActive ? "active" : ""}`}
                >
                  {link.label}
                  {link.showCount && reviewableProducts.length > 0 && (
                    <span style={{ marginLeft: "4px" }}>({reviewableProducts.length})</span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); if (!isLoggingOut) setShowLogoutConfirm(true); }}
              className="my-account-nav-item"
              style={{ cursor: isLoggingOut ? "wait" : "pointer" }}
            >
              {isLoggingOut ? t.loggingOut : t.logout}
            </a>
          </li>
        </ul>
      </div>

      <style jsx global>{`
        @media (min-width: 992px) {
          .dashboard-sidebar-sticky {
            position: sticky;
            top: 120px;
            z-index: 10;
          }
        }
      `}</style>

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "320px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "30px 25px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "10px", color: "#333", fontWeight: "700" }}>
              {isLoggingOut ? t.loggingOut : t.logoutConfirm}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
              <button
                onClick={doLogout}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: isLoggingOut ? "#999" : "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoggingOut ? "wait" : "pointer",
                }}
              >
                {t.yesLogout}
              </button>
              <button
                onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReviewDashboardModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        products={reviewableProducts}
      />
    </>
  );
}
