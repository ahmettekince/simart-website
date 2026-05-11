import { useLangStore } from "@/stores/langStore";

const translations = {
    tr: {
        title: "Ödeme Bilgilendirmesi",
        description: "**Tek çekim** ödemeler web sitemizde aktif durumdadır.\n\nTaksitli ödeme seçeneğimiz çok yakında aktif olacaktır. Şu an için taksitli alışverişlerinizi pazar yeri mağazalarımız üzerinden gerçekleştirebilirsiniz.",
    },
    en: {
        title: "Payment Information",
        description: "**Single payment** orders are now active on our website.\n\nInstallment payment options will be available soon. For now, you can complete your installment purchases through our marketplace stores:",
    }
};

export default function PaymentStatusNotification() {
    const lang = useLangStore((s) => s.lang);
    const t = translations[lang] || translations.tr;

    return (
        <div className="payment-status-notification p-3 mt-3">
            <div className="notification-content">
                <div className="fw-bold mb-2" style={{ fontSize: "16px", color: "#3c81b5" }}>{t.title}</div>
                <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {t.description.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: "#3c81b5" }}>{part}</strong> : part)}
                </div>
                <div className="mt-3 marketplace-links" style={{ fontSize: "14px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                    <a href="https://www.mediamarkt.com.tr/tr/search.html?query=%C5%9F%C4%B1mart" target="_blank" rel="noopener noreferrer" className="market-link">MediaMarkt</a>
                    <span className="separator">•</span>
                    <a href="https://www.trendyol.com/magaza/simart-pazarlama-m-790294?channelId=1&sst=0&sk=1" target="_blank" rel="noopener noreferrer" className="market-link">Trendyol</a>
                    <span className="separator">•</span>
                    <a href="https://www.hepsiburada.com/magaza/simart-pazarlama" target="_blank" rel="noopener noreferrer" className="market-link">Hepsiburada</a>
                    <span className="separator">•</span>
                    <a href="https://www.n11.com/arama?m=%C5%9E%C4%B1mart+Teknoloji" target="_blank" rel="noopener noreferrer" className="market-link">n11</a>
                    <span className="separator">•</span>
                    <a href="https://www.pazarama.com/magaza/simart-teknoloji" target="_blank" rel="noopener noreferrer" className="market-link">Pazarama</a>
                    <span className="separator">•</span>
                    <a href="https://www.ciceksepeti.com/d/tum-urunler?storeid=1500071511" target="_blank" rel="noopener noreferrer" className="market-link">Çiçeksepeti</a>
                    <span className="separator">•</span>
                    <a href="https://www.teknosa.com/magaza/simart-pazarlama" target="_blank" rel="noopener noreferrer" className="market-link">Teknosa</a>
                    <span className="separator">•</span>
                    <a href="https://www.pttavm.com/magaza/simartpazarlama" target="_blank" rel="noopener noreferrer" className="market-link">PttAVM</a>
                </div>
            </div>

            <style jsx>{`
                .payment-status-notification {
                    background-color: #f0f7ff;
                    border: 2px solid #3c81b5;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    animation: borderPulseBlue 3s infinite ease-in-out;
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

                .separator {
                    color: #b3d7f2;
                }

                @keyframes borderPulseBlue {
                    0% {
                        border-color: #3c81b5;
                        box-shadow: 0 0 0px rgba(60, 129, 181, 0);
                    }
                    50% {
                        border-color: #2a5a7d;
                        box-shadow: 0 0 12px rgba(60, 129, 181, 0.4);
                    }
                    100% {
                        border-color: #3c81b5;
                        box-shadow: 0 0 0px rgba(60, 129, 181, 0);
                    }
                }

                .notification-content {
                    text-align: left;
                }

                @media (max-width: 768px) {
                    .payment-status-notification {
                        padding: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}
