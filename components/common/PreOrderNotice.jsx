import React from 'react';
import { useLangStore } from "@/stores/langStore";

const translations = {
    tr: {
        message: "Bu ön siparişiniz en geç 6 mayısta kargoya verilecektir."
    },
    en: {
        message: "This pre-order will be shipped by May 6th at the latest."
    }
};

export default function PreOrderNotice({ productSlug }) {
    const lang = useLangStore((s) => s.lang);
    const t = translations[lang] || translations.tr;

    const preOrderSlugs = [
        "katya-v-plus-akilli-robot-supurge",
        "katya-v-akilli-robot-supurge"
    ];

    if (!preOrderSlugs.includes(productSlug)) return null;

    return (
        <div className="pre-order-box d-flex align-items-center p-3 mt-3 gap-3">
            <div className="icon-box" style={{ flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="text-box">
                <div className="fw-medium" style={{ fontSize: "14px", color: "#3c81b5", lineHeight: "1.4" }}>
                    {t.message}
                </div>
            </div>

            <style jsx>{`
                .pre-order-box {
                    background-color: #f0f7ff;
                    border: 2px solid #3c81b5;
                    border-radius: 12px;
                }
                @media (max-width: 768px) {
                    .pre-order-box {
                        gap: 12px;
                    }
                }
            `}</style>
        </div>
    );
}
