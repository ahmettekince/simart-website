"use client";

import { useEffect } from "react";

/**
 * Maksimum adet sınırına ulaşıldığında sağ üstte gösterilen kırmızı bildirim.
 * visible true iken render edilir, autoHide ms sonra onHide çağrılır.
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
        top: "80px",
        right: "16px",
        zIndex: 10060,
        background: "#dc2626",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        maxWidth: "320px",
      }}
    >
      Maksimum adet sınırına ulaştınız.
    </div>
  );
}
