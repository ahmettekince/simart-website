"use client";

import React, { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useLangStore } from "@/stores/langStore";

/**
 * Sepeti Temizle butonu - onay modalı ile birlikte
 * @param {string} variant - "button" (sepet sayfası) | "inline" (cart modal)
 */
export default function ClearCartButton({ variant = "button" }) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const lang = useLangStore((state) => state.lang);

  const translations = {
    tr: {
      title: "Sepeti Temizle?",
      desc: "Sepetinizdeki tüm ürünleri temizlemek istediğinize emin misiniz?",
      confirm: "Evet, Temizle",
      cancel: "Vazgeç",
      clearing: "Temizleniyor...",
      trigger: "Sepeti Temizle"
    },
    en: {
      title: "Clear Cart?",
      desc: "Are you sure you want to clear all products in your cart?",
      confirm: "Yes, Clear",
      cancel: "Cancel",
      clearing: "Clearing...",
      trigger: "Clear Cart"
    }
  };

  const dict = translations[lang] || translations.tr;

  const [isClearingCart, setIsClearingCart] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCart = () => {
    if (isClearingCart || items.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    setShowClearConfirm(false);
    setIsClearingCart(true);
    try {
      await clearCart();
    } catch (error) {
      console.error("Sepet temizleme hatası:", error);
    } finally {
      setIsClearingCart(false);
    }
  };

  if (items.length === 0) return null;

  const triggerProps = {
    onClick: handleClearCart,
    disabled: isClearingCart,
    style: {
      cursor: isClearingCart ? "not-allowed" : "pointer",
    },
  };

  return (
    <>
      {/* Onay Dialogu */}
      {showClearConfirm && (
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
              borderRadius: "16px",
              padding: "30px 25px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              animation: "fadeInScale 0.2s ease-out",
            }}
          >
            <style>{`@keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
            <div style={{ fontSize: "18px", marginBottom: "10px", color: "#333", fontWeight: "700" }}>
              {dict.title}
            </div>
            <div style={{ fontSize: "14px", marginBottom: "25px", color: "#666", lineHeight: "1.5" }}>
              {dict.desc}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={confirmClearCart}
                className="clear-cart-confirm-btn"
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s, filter 0.2s",
                }}
                onMouseEnter={(e) => { e.target.style.filter = "brightness(0.9)"; }}
                onMouseLeave={(e) => { e.target.style.filter = "none"; }}
              >
                {dict.confirm}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {dict.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger */}
      {variant === "button" ? (
        <button
          {...triggerProps}
          className="text_primary fw-6 bg-transparent border-0 underline"
          style={{ ...triggerProps.style, fontSize: "14px", color: "var(--primary)" }}
        >
          {isClearingCart ? dict.clearing : dict.trigger}
        </button>
      ) : (
        <span
          {...triggerProps}
          style={{
            fontSize: "12px",
            color: isClearingCart ? "#ccc" : "var(--primary)",
            textDecoration: "underline",
            marginLeft: "15px",
            fontWeight: "400",
            ...triggerProps.style,
          }}
        >
          {isClearingCart ? dict.clearing : dict.trigger}
        </span>
      )}
    </>
  );
}
