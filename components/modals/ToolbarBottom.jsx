"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartLength from "../common/CartLength";
import { useAuthStore } from "@/stores/authStore";
import { openCartModal } from "@/utils/openCartModal";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";
import { i18n } from "@/config/i18n";

export default function ToolbarBottom() {
  const { isAuthenticated } = useAuthStore();
  const { lang } = useLangStore();
  const pathname = usePathname();

  const translations = {
    tr: {
      magaza: "Mağaza",
      ara: "Ara",
      anasayfa: "Anasayfa",
      hesap: "Hesap",
      sepetim: "Sepetim",
    },
    en: {
      magaza: "Shop",
      ara: "Search",
      anasayfa: "Home",
      hesap: "Account",
      sepetim: "My Cart",
    },
  };

  const t = translations[lang] || translations.tr;

  // Aktif durum kontrolü için dil önekini temizleyip kontrol edelim
  const parts = pathname.split("/").filter(Boolean);
  const cleanPath = (parts.length > 0 && i18n.locales.includes(parts[0]))
    ? "/" + parts.slice(1).join("/")
    : pathname;

  const isHomeActive = cleanPath === "/";
  const isMagazaActive = cleanPath.startsWith("/magaza") || cleanPath.startsWith("/shop");
  const isHesapActive =
    cleanPath.startsWith("/hesabim") ||
    cleanPath.startsWith("/siparislerim") ||
    cleanPath.startsWith("/degerlendirmelerim") ||
    cleanPath.startsWith("/adreslerim") ||
    cleanPath.startsWith("/kupon-kodlarim") ||
    cleanPath.startsWith("/paylas-simart") ||
    cleanPath.startsWith("/my-account") ||
    cleanPath.startsWith("/my-orders") ||
    cleanPath.startsWith("/my-reviews") ||
    cleanPath.startsWith("/my-addresses") ||
    cleanPath.startsWith("/my-coupons") ||
    cleanPath.startsWith("/share-simart") ||
    cleanPath.startsWith("/giris-yap") ||
    cleanPath.startsWith("/login") ||
    cleanPath.startsWith("/kayit-ol") ||
    cleanPath.startsWith("/register") ||
    cleanPath.startsWith("/sifremi-unuttum") ||
    cleanPath.startsWith("/forgot-password");

  return (
    <div className="tf-toolbar-bottom type-1150">
      <div className={`toolbar-item ${isMagazaActive ? "active" : ""}`}>
        <Link href={getLocalizedUrl("/magaza", lang)}>
          <div className="toolbar-icon">
            <i className="icon-shop" />
          </div>
          <div className="toolbar-label">{t.magaza}</div>
        </Link>
      </div>
      <div className="toolbar-item">
        <a
          href="#canvasSearch"
          data-bs-toggle="offcanvas"
          aria-controls="offcanvasLeft"
        >
          <div className="toolbar-icon">
            <i className="icon-search" />
          </div>
          <div className="toolbar-label">{t.ara}</div>
        </a>
      </div>
      <div className={`toolbar-item ${isHomeActive ? "active" : ""}`}>
        <Link href={getLocalizedUrl("/", lang)}>
          <div className="toolbar-icon">
            <i className="icon-home" />
          </div>
          <div className="toolbar-label">{t.anasayfa}</div>
        </Link>
      </div>
      <div className={`toolbar-item ${isHesapActive ? "active" : ""}`}>
        <Link href={getLocalizedUrl(isAuthenticated ? "/hesabim" : "/giris-yap", lang)}>
          <div className="toolbar-icon">
            <i className="icon-account" />
          </div>
          <div className="toolbar-label">{t.hesap}</div>
        </Link>
      </div>
      <div className="toolbar-item">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openCartModal();
          }}
        >
          <div className="toolbar-icon">
            <i className="icon-bag" />
            <div className="toolbar-count">
              <CartLength />
            </div>
          </div>
          <div className="toolbar-label">{t.sepetim}</div>
        </a>
      </div>
    </div>
  );
}
