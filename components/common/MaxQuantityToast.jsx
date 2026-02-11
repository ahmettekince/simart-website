"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Maksimum adet sınırına ulaşıldığında gösterilen kırmızı bildirim.
 * Portal ile body'ye render edilir, parent container'dan bağımsızdır.
 */
export default function MaxQuantityToast({ visible, onHide, autoHideMs = 3000, maxQuantity = null, isStockLimit = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!visible || !onHide) return;
    const t = setTimeout(() => {
      onHide();
    }, autoHideMs);
    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoHideMs]);

  if (!visible || !mounted) {
    return null;
  }

  const message = isStockLimit
    ? `Yetersiz Stok. Bu üründen en fazla ${maxQuantity} adet alabilirsiniz.`
    : maxQuantity != null && maxQuantity > 0
      ? `Bu üründen en fazla ${maxQuantity} adet alabilirsiniz.`
      : "Maksimum adet sınırına ulaştınız.";

  const toastContent = (
    <div
      className="max-quantity-toast"
      role="alert"
      aria-live="polite"
      onClick={onHide}
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
        pointerEvents: "auto",
        cursor: "pointer",
      }}
    >
      {message}
    </div>
  );

  return createPortal(toastContent, document.body);
}
