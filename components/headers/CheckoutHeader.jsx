import React from "react";
import Image from "next/image";
import Link from "next/link";
import CartLength from "@/components/common/CartLength";
import SimartLogo from "@/components/common/SimartLogo";

/**
 * Ödeme sayfası header - solda logo, sağda Alışverişe Devam Et ve Sepet ikonu.
 */
export default function CheckoutHeader() {
  return (
    <header className="checkout-header">
      <div className="checkout-header-inner">
        <Link href="/" className="checkout-header-logo">
          <SimartLogo width="136" height="21" />
        </Link>
        <div className="checkout-header-actions">
          <Link href="/" className="checkout-header-btn">
            <i className="icon icon-arrow-left" style={{ fontSize: '12px' }} />
            <span>Alışverişe Devam Et</span>
          </Link>
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
