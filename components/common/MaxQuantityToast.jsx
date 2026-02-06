"use client";

import { useEffect } from "react";

/**
 * Maksimum adet sınırına ulaşıldığında gösterilen kırmızı bildirim.
 * Sabit ve merkezi konum (mobil + masaüstü), viewport'a göre her zaman görünür.
 */
export default function MaxQuantityToast({ visible, onHide, autoHideMs = 3000 }) {
  useEffect(() => {
    if (!visible || !onHide) return;
    const t = setTimeout(onHide, autoHideMs);
    return () => clearTimeout(t);
  }, [visible, onHide, autoHideMs]);

  if (!visible) return null;

  return (
    <div
      className="max-quantity-toast"
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 99999,
        background: "#dc2626",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        maxWidth: "min(320px, calc(100vw - 32px))",
        width: "max-content",
      }}
    >
      Maksimum adet sınırına ulaştınız.
    </div>
  );
}
