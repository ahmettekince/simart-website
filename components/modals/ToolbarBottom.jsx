"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartLength from "../common/CartLength";
import { useAuthStore } from "@/stores/authStore";
import { openCartModal } from "@/utils/openCartModal";

export default function ToolbarBottom() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  // Aktif durum kontrolü
  const isHomeActive = pathname === "/";
  const isMagazaActive = pathname.startsWith("/magaza");
  const isHesapActive = pathname.startsWith("/hesabim") || pathname.startsWith("/giris-yap") || pathname.startsWith("/kayit-ol") || pathname.startsWith("/sifremi-sifirlama") || pathname.startsWith("/adreslerim") || pathname.startsWith("/my-account");

  return (
    <div className="tf-toolbar-bottom type-1150">
      <div className={`toolbar-item ${isMagazaActive ? "active" : ""}`}>
        <Link href="/magaza">
          <div className="toolbar-icon">
            <i className="icon-shop" />
          </div>
          <div className="toolbar-label">Mağaza</div>
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
          <div className="toolbar-label">Ara</div>
        </a>
      </div>
      <div className={`toolbar-item ${isHomeActive ? "active" : ""}`}>
        <Link href="/">
          <div className="toolbar-icon">
            <i className="icon-home" />
          </div>
          <div className="toolbar-label">Anasayfa</div>
        </Link>
      </div>
      <div className={`toolbar-item ${isHesapActive ? "active" : ""}`}>
        <Link href={isAuthenticated ? "/hesabim" : "/giris-yap"}>
          <div className="toolbar-icon">
            <i className="icon-account" />
          </div>
          <div className="toolbar-label">Hesap</div>
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
          <div className="toolbar-label">Sepetim</div>
        </a>
      </div>
    </div>
  );
}
