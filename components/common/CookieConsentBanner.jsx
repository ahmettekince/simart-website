"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

// cookie_consent: "accepted" | "declined"
// cookie_consent_analytics: "true" | "false" (sadece accepted iken anlamlı)

const COOKIE_NAME = "cookie_consent";
const COOKIE_ANALYTICS = "cookie_consent_analytics";
const COOKIE_EXPIRY = 365;

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (key) => {
        setExpandedSection((prev) => (prev === key ? null : key));
    };

    useEffect(() => {
        const consent = Cookies.get(COOKIE_NAME);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const notifyConsentUpdate = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("cookieConsentUpdated"));
        }
    };

    const saveAndClose = (analytics) => {
        Cookies.set(COOKIE_NAME, "accepted", { expires: COOKIE_EXPIRY });
        Cookies.set(COOKIE_ANALYTICS, analytics ? "true" : "false", { expires: COOKIE_EXPIRY });
        setVisible(false);
        setSettingsOpen(false);
        notifyConsentUpdate();
    };

    const accept = () => {
        saveAndClose(true);
    };

    const decline = () => {
        Cookies.set(COOKIE_NAME, "declined", { expires: COOKIE_EXPIRY });
        Cookies.set(COOKIE_ANALYTICS, "false", { expires: COOKIE_EXPIRY });
        setVisible(false);
        setSettingsOpen(false);
        notifyConsentUpdate();
    };

    const openSettings = () => {
        setSettingsOpen(true);
    };

    // Modal kapatıldığında çerez kaydetme: seçimleri onaylamadı = cevap vermedi, banner kalsın
    const closeSettings = () => {
        setSettingsOpen(false);
        // decline() çağrılmıyor: kullanıcı sadece "Seçimleri Onayla" ile onay vermiş sayılır
    };

    const handleSaveSettings = () => {
        saveAndClose(analyticsEnabled);
    };

    const handleAcceptAllInModal = () => {
        setAnalyticsEnabled(true);
        saveAndClose(true);
    };

    if (!visible) return null;

    return (
        <>
            <div className="cookie-banner-simart">
                <div className="cookie-banner-inner">
                    <div className="cookie-banner-content">
                        <h3 className="cookie-banner-title">Sana Özel Bir Deneyim Sunuyoruz</h3>
                        <p className="cookie-banner-text">
                            Sitenin temel görevlerinin çalışması, kampanya ve duyurulardan haberdar olmanız için çerezler kullanıyoruz.
                            Tümünü reddet&apos;i seçerseniz bazı özelliklerden yararlanamayabilirsiniz.
                            {" "}
                            <Link href="/gizlilik-politikasi" className="cookie-banner-link">
                                Gizlilik Politikası
                            </Link>
                        </p>
                    </div>
                    <div className="cookie-banner-buttons">
                        <button type="button" onClick={openSettings} className="cookie-btn cookie-btn-ayarlar">
                            Ayarlar
                        </button>
                        <button type="button" onClick={decline} className="cookie-btn cookie-btn-decline">
                            Tümünü Reddet
                        </button>
                        <button type="button" onClick={accept} className="cookie-btn cookie-btn-accept">
                            Tümünü Kabul Et
                        </button>
                    </div>
                </div>
            </div>

            {settingsOpen && (
                <div className="cookie-settings-overlay" onClick={closeSettings} role="presentation">
                    <div
                        className="cookie-settings-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-labelledby="cookie-settings-title"
                    >
                        <div className="cookie-settings-header">
                            <h2 id="cookie-settings-title" className="cookie-settings-title">
                                Çerez Ayarları
                            </h2>
                            <button
                                type="button"
                                className="cookie-settings-close"
                                onClick={closeSettings}
                                aria-label="Kapat"
                            >
                                ×
                            </button>
                        </div>

                        <div className="cookie-settings-body">
                            {/* Zorunlu - Her Zaman Etkin */}
                            <section className="cookie-category">
                                <div
                                    className="cookie-category-header cookie-category-header-clickable"
                                    onClick={() => toggleSection("essential")}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && toggleSection("essential")}
                                    aria-expanded={expandedSection === "essential"}
                                >
                                    <span className="cookie-category-icon">{expandedSection === "essential" ? "−" : "+"}</span>
                                    <h3 className="cookie-category-title">Zorunlu Tanımlama Bilgileri</h3>
                                    <span className="cookie-category-badge cookie-category-always">Her Zaman Etkin</span>
                                </div>
                                {expandedSection === "essential" && (
                                    <div className="cookie-category-content">
                                        <p className="cookie-category-desc">
                                            Web sitemizin düzgün şekilde çalışabilmesi için bazı çerezler zorunlu olarak kullanılmaktadır ve bu çerezler sistemlerimiz üzerinden devre dışı bırakılamaz. Bu çerezler genellikle sizin talep ettiğiniz hizmetlerin sağlanması amacıyla ayarlanır. Örneğin; gizlilik ayarlarınızı kaydetmek, hesabınıza giriş yapabilmenizi sağlamak veya formlar üzerinden gönderdiğiniz bilgileri işleyebilmek için kullanılabilir.
                                            {" "}
                                            Tarayıcı ayarlarınızı değiştirerek bu çerezleri engelleyebilir veya çerez kullanımı hakkında bildirim almayı tercih edebilirsiniz. Ancak bu durumda web sitemizin bazı özellikleri beklenen şekilde çalışmayabilir.
                                        </p>
                                        <Link href="/gizlilik-politikasi" className="cookie-vendor-link">
                                            Satıcı Ayrıntılarını Görüntüle
                                        </Link>
                                    </div>
                                )}
                            </section>

                            {/* Analitik - seçilebilir (GA vb.) */}
                            <section className="cookie-category">
                                <div
                                    className="cookie-category-header cookie-category-header-clickable"
                                    onClick={() => toggleSection("analytics")}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && toggleSection("analytics")}
                                    aria-expanded={expandedSection === "analytics"}
                                >
                                    <span className="cookie-category-icon">{expandedSection === "analytics" ? "−" : "+"}</span>
                                    <h3 className="cookie-category-title">Analitik Tanımlama Bilgileri</h3>
                                    <label className="cookie-toggle-wrap" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="cookie-toggle-input"
                                            checked={analyticsEnabled}
                                            onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                                        />
                                        <span className="cookie-toggle-slider" />
                                    </label>
                                </div>
                                {expandedSection === "analytics" && (
                                    <div className="cookie-category-content">
                                        <p className="cookie-category-desc">
                                            Bu çerezler analiz amaçları için kullanılır. Ziyaretçi davranışını ve site kullanımını anlamamıza yardımcı olur.
                                        </p>
                                        <Link href="/gizlilik-politikasi" className="cookie-vendor-link">
                                            Satıcı Ayrıntılarını Görüntüle
                                        </Link>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="cookie-settings-footer">
                            <button type="button" onClick={handleSaveSettings} className="cookie-btn cookie-btn-accept cookie-btn-single">
                                Seçimleri Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
