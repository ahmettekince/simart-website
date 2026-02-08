"use client";

import React from "react";
import Link from "next/link";

/**
 * Anasayfa ürün kartları (main-cart-btn) ile aynı stilde buton.
 * success=true iken yeşil (kaydedildi/doğrulandı).
 * variant="outline" iken beyaz arka plan, primary border.
 * href verilirse Link olarak render edilir.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Buton içeriği
 * @param {string} [props.href] - Link URL (verilirse buton yerine Link)
 * @param {'button'|'submit'} [props.type='button'] - Buton tipi
 * @param {boolean} [props.disabled=false] - Devre dışı
 * @param {boolean} [props.success=false] - Başarı durumu (yeşil stil)
 * @param {'fill'|'outline'} [props.variant='fill'] - fill=primary bg, outline=white bg
 * @param {Function} [props.onClick] - Tıklama handler
 * @param {string} [props.className] - Ek class'lar
 * @param {Object} [props.style] - Ek inline stil
 * @param {boolean} [props.fullWidth=false] - true ise width: 100%, false ise container'a göre
 */
export default function SimartButton({
  children,
  href,
  type = "button",
  disabled = false,
  success = false,
  variant = "fill",
  onClick,
  className = "",
  style = {},
  fullWidth = false,
}) {
  const baseClass = `simart-btn ${success ? "simart-btn--success" : ""} ${variant === "outline" ? "simart-btn--outline" : ""} ${className}`.trim();
  const baseStyle = { width: fullWidth ? "100%" : undefined, ...style };

  if (href) {
    return (
      <Link
        href={href}
        className={baseClass}
        style={baseStyle}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={baseClass}
      style={baseStyle}
    >
      {children}
    </button>
  );
}
