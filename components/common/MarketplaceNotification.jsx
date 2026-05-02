import { useLangStore } from "@/stores/langStore";

const translations = {
    tr: {
        title: "Satın Alma Bildirimi",
        description: "Değerli müşterilerimiz,\nödeme altyapımızda gerçekleştirilen bakım çalışması nedeniyle web sitemiz üzerinden şu an sipariş verilememektedir.\n\nÇalışma en kısa sürede tamamlanacaktır.\nBu süreçte ürünlerimizi aşağıdaki platformlar üzerinden güvenle satın alabilirsiniz.",
        platforms: "Hepsiburada, Trendyol, Amazon, Çiçeksepeti, n11, Pazarama, PttAVM ve Allesgo"
    },
    en: {
        title: "Purchase Notification",
        description: "Dear customers,\ndue to maintenance work on our payment infrastructure, we are currently unable to accept orders through our website.\n\nThe work will be completed as soon as possible.\nIn the meantime, you can safely purchase our products through the following platforms.",
        platforms: "Hepsiburada, Trendyol, Amazon, Çiçeksepeti, n11, Pazarama, PttAVM, and Allesgo"
    }
};

export default function MarketplaceNotification() {
    const lang = useLangStore((s) => s.lang);
    const t = translations[lang] || translations.tr;

    return (
        <div className="marketplace-notification p-3 mt-3">
            <div className="notification-content">
                <div className="fw-bold mb-2" style={{ fontSize: "16px", color: "#d32f2f" }}>{t.title}</div>
                <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {t.description}
                </div>
                <div className="mt-3 marketplace-links" style={{ fontSize: "14px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                    <a href="https://www.hepsiburada.com/magaza/simart-pazarlama" target="_blank" rel="noopener noreferrer" className="market-link">Hepsiburada</a>
                    <span className="separator">•</span>
                    <a href="https://www.trendyol.com/magaza/simart-pazarlama-m-790294?channelId=1&sst=0&sk=1" target="_blank" rel="noopener noreferrer" className="market-link">Trendyol</a>
                    <span className="separator">•</span>
                    <a href="https://www.n11.com/arama?m=%C5%9E%C4%B1mart+Teknoloji" target="_blank" rel="noopener noreferrer" className="market-link">n11</a>
                    <span className="separator">•</span>
                    <a href="https://www.pazarama.com/magaza/simart-teknoloji" target="_blank" rel="noopener noreferrer" className="market-link">Pazarama</a>
                    <span className="separator">•</span>
                    <a href="https://www.pttavm.com/magaza/simartpazarlama" target="_blank" rel="noopener noreferrer" className="market-link">PttAVM</a>
                    <span className="separator">•</span>
                    <a href="https://www.allesgo.com/b2c/magaza/simart-teknoloji" target="_blank" rel="noopener noreferrer" className="market-link">Allesgo</a>
                    <span className="separator">•</span>
                    <a href="https://www.mediamarkt.com.tr/tr/search.html?query=%C5%9F%C4%B1mart" target="_blank" rel="noopener noreferrer" className="market-link">MediaMarkt</a>
                    <span className="separator">•</span>
                    <a href="https://www.ciceksepeti.com/d/tum-urunler?storeid=1500071511" target="_blank" rel="noopener noreferrer" className="market-link">Çiçeksepeti</a>
                </div>
            </div>

            <style jsx>{`
                .marketplace-notification {
                    background-color: #fff5f5;
                    border: 2px solid #ef5350;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    animation: borderPulseRed 3s infinite ease-in-out;
                    position: relative;
                    overflow: hidden;
                }

                .market-link {
                    color: #3c81b5;
                    font-weight: 700;
                    text-decoration: underline;
                    transition: color 0.2s;
                }

                .market-link:hover {
                    opacity: 0.7;
                }

                .market-text {
                    color: #3c81b5;
                    font-weight: 600;
                }

                .separator {
                    color: #ef9a9a;
                }

                @keyframes borderPulseRed {
                    0% {
                        border-color: #ef5350;
                        box-shadow: 0 0 0px rgba(239, 83, 80, 0);
                    }
                    50% {
                        border-color: #d32f2f;
                        box-shadow: 0 0 12px rgba(211, 47, 47, 0.4);
                    }
                    100% {
                        border-color: #ef5350;
                        box-shadow: 0 0 0px rgba(239, 83, 80, 0);
                    }
                }

                .notification-content {
                    text-align: left;
                }

                @media (max-width: 768px) {
                    .marketplace-notification {
                        padding: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}
