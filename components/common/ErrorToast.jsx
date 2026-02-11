"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Genel amaçlı hata bildirimi.
 */
export default function ErrorToast({ visible, onHide, autoHideMs = 4000, message = "Bir hata oluştu." }) {
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

    const toastContent = (
        <div
            className="error-toast"
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
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)",
                maxWidth: "min(340px, calc(100vw - 32px))",
                width: "max-content",
                animation: "slideInRight 0.3s ease-out forwards",
                cursor: "pointer",
            }}
        >
            <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{message}</span>
            </div>
        </div>
    );

    return createPortal(toastContent, document.body);
}
