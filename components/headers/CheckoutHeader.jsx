"use client";

import React from "react";
import CartLength from "@/components/common/CartLength";
import SimartLogo from "@/components/common/SimartLogo";
import { useLangStore } from "@/stores/langStore";

const translations = {
  tr: {
    continueShopping: "Alışverişe Devam Et",
    link: "/"
  },
  en: {
    continueShopping: "Continue Shopping",
    link: "/en/shop"
  }
};

/**
 * Ödeme sayfası header - solda logo, sağda Alışverişe Devam Et ve Sepet ikonu.
 */
export default function CheckoutHeader() {
  const lang = useLangStore((s) => s.lang);
  const t = translations[lang] || translations.tr;

  return (
    <header className="checkout-header">
      <div className="checkout-header-inner">
        <a href={t.link} className="checkout-header-logo">
          <SimartLogo width="136" height="21" />
        </a>
        <div className="checkout-header-actions">
          <a href={t.link} className="checkout-header-btn">
            <i className="icon icon-arrow-left" style={{ fontSize: "12px" }} />
            <span>{t.continueShopping}</span>
          </a>
          <div className="checkout-header-divider" />
          <a
            href="#shoppingCart"
            data-bs-toggle="modal"
            className="checkout-header-cart"
          >
            <i className="icon icon-bag" />
            <span className="checkout-header-cart-count">
              <CartLength />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
