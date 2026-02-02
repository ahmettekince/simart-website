import React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Ödeme sayfası header - solda logo, sağda Alışverişe Devam Et butonu.
 */
export default function CheckoutHeader() {
  return (
    <header className="checkout-header">
      <div className="checkout-header-inner">
        <Link href="/" className="checkout-header-logo">
          <Image
            alt="logo"
            src="/images/logo/logo.svg"
            width="136"
            height="21"
          />
        </Link>
        <Link href="/" className="checkout-header-btn">
          <i className="icon icon-bag" />
          <span>Alışverişe Devam Et</span>
        </Link>
      </div>
    </header>
  );
}
