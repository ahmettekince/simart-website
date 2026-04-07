"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useLangStore } from "@/stores/langStore";

// cookie_consent: "accepted" | "declined"
// cookie_consent_analytics: "true" | "false" (sadece accepted iken anlamlı)

const COOKIE_NAME = "cookie_consent";
const COOKIE_ANALYTICS = "cookie_consent_analytics";
const COOKIE_EXPIRY = 365;

export default function CookieConsentBanner() {
    const { lang } = useLangStore();
    const [visible, setVisible] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [expandedSection, setExpandedSection] = useState(null);

    const t = {
        tr: {
            title: "Sana Özel Bir Deneyim Sunuyoruz",
            description: "Sitenin temel görevlerinin çalışması, kampanya ve duyurulardan haberdar olmanız için çerezler kullanıyoruz. Tümünü reddet'i seçerseniz bazı özelliklerden yararlanamayabilirsiniz.",
            privacyPolicy: "Gizlilik Politikası",
            privacyPolicyLink: "/gizlilik-politikasi",
            settings: "Ayarlar",
            declineAll: "Tümünü Reddet",
            acceptAll: "Tümünü Kabul Et",
            settingsTitle: "Çerez Ayarları",
            essentialTitle: "Zorunlu Tanımlama Bilgileri",
            essentialAlwaysActive: "Her Zaman Etkin",
            essentialDesc: "Web sitemizin düzgün şekilde çalışabilmesi için bazı çerezler zorunlu olarak kullanılmaktadır ve bu çerezler sistemlerimiz üzerinden devre dışı bırakılamaz. Bu çerezler genellikle sizin talep ettiğiniz hizmetlerin sağlanması amacıyla ayarlanır. Örneğin; gizlilik ayarlarınızı kaydetmek, hesabınıza giriş yapabilmenizi sağlamak veya formlar üzerinden gönderdiğiniz bilgileri işleyebilmek için kullanılabilir. Tarayıcı ayarlarınızı değiştirerek bu çerezleri engelleyebilir veya çerez kullanımı hakkında bildirim almayı tercih edebilirsiniz. Ancak bu durumda web sitemizin bazı özellikleri beklenen şekilde çalışmayabilir.",
            analyticsTitle: "Analitik Tanımlama Bilgileri",
            analyticsDesc: "Bu çerezler analiz amaçları için kullanılır. Ziyaretçi davranışını ve site kullanımını anlamamıza yardımcı olur.",
            viewVendorDetails: "Satıcı Ayrıntılarını Görüntüle",
            confirmChoices: "Seçimleri Onayla"
        },
        en: {
            title: "We Offer You a Special Experience",
            description: "We use cookies for the basic functions of the site to work and to keep you informed about campaigns and announcements. If you choose 'Decline All', you may not be able to benefit from some features.",
            privacyPolicy: "Privacy Policy",
            privacyPolicyLink: "/en/privacy-policy",
            settings: "Settings",
            declineAll: "Decline All",
            acceptAll: "Accept All",
            settingsTitle: "Cookie Settings",
            essentialTitle: "Essential Cookies",
            essentialAlwaysActive: "Always Active",
            essentialDesc: "Some cookies are mandatory for our website to function properly and cannot be disabled via our systems. These cookies are usually set to provide the services you request. For example; they can be used to save your privacy settings, enable you to log in to your account, or process information you submit via forms. You can block these cookies or choose to be notified about cookie use by changing your browser settings. However, in this case, some features of our website may not work as expected.",
            analyticsTitle: "Analytical Cookies",
            analyticsDesc: "These cookies are used for analytical purposes. They help us understand visitor behavior and site usage.",
            viewVendorDetails: "View Vendor Details",
            confirmChoices: "Confirm Choices"
        }
    }[lang] || {
        tr: {
            title: "Sana Özel Bir Deneyim Sunuyoruz",
            description: "Sitenin temel görevlerinin çalışması, kampanya ve duyurulardan haberdar olmanız için çerezler kullanıyoruz. Tümünü reddet'i seçerseniz bazı özelliklerden yararlanamayabilirsiniz.",
            privacyPolicy: "Gizlilik Politikası",
            privacyPolicyLink: "/gizlilik-politikasi",
            settings: "Ayarlar",
            declineAll: "Tümünü Reddet",
            acceptAll: "Tümünü Kabul Et",
            settingsTitle: "Çerez Ayarları",
            essentialTitle: "Zorunlu Tanımlama Bilgileri",
            essentialAlwaysActive: "Her Zaman Etkin",
            essentialDesc: "Web sitemizin düzgün şekilde çalışabilmesi için bazı çerezler zorunlu olarak kullanılmaktadır ve bu çerezler sistemlerimiz üzerinden devre dışı bırakılamaz. Bu çerezler genellikle sizin talep ettiğiniz hizmetlerin sağlanması amacıyla ayarlanır. Örneğin; gizlilik ayarlarınızı kaydetmek, hesabınıza giriş yapabilmenizi sağlamak veya formlar üzerinden gönderdiğiniz bilgileri işleyebilmek için kullanılabilir. Tarayıcı ayarlarınızı değiştirerek bu çerezleri engelleyebilir veya çerez kullanımı hakkında bildirim almayı tercih edebilirsiniz. Ancak bu durumda web sitemizin bazı özellikleri beklenen şekilde çalışmayabilir.",
            analyticsTitle: "Analitik Tanımlama Bilgileri",
            analyticsDesc: "Bu çerezler analiz amaçları için kullanılır. Ziyaretçi davranışını ve site kullanımını anlamamıza yardımcı olur.",
            viewVendorDetails: "Satıcı Ayrıntılarını Görüntüle",
            confirmChoices: "Seçimleri Onayla"
        }
    }.tr;

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

    const updateGoogleConsent = (analytics) => {
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("consent", "update", {
                ad_storage: analytics ? "granted" : "denied",
                ad_user_data: analytics ? "granted" : "denied",
                ad_personalization: analytics ? "granted" : "denied",
                analytics_storage: analytics ? "granted" : "denied",
            });
            // GTM'e durumun güncellendiğine dair bir event de atalım
            window.dataLayer.push({ event: "consent_updated", analytics_enabled: analytics });
        }
    };

    const saveAndClose = (analytics) => {
        Cookies.set(COOKIE_NAME, "accepted", { expires: COOKIE_EXPIRY });
        Cookies.set(COOKIE_ANALYTICS, analytics ? "true" : "false", { expires: COOKIE_EXPIRY });
        updateGoogleConsent(analytics);
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
        updateGoogleConsent(false);
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
                        <h3 className="cookie-banner-title">{t.title}</h3>
                        <p className="cookie-banner-text">
                            {t.description}
                            {" "}
                            <Link href={t.privacyPolicyLink} className="cookie-banner-link">
                                {t.privacyPolicy}
                            </Link>
                        </p>
                    </div>
                    <div className="cookie-banner-buttons">
                        <button type="button" onClick={openSettings} className="cookie-btn cookie-btn-ayarlar">
                            {t.settings}
                        </button>
                        <button type="button" onClick={decline} className="cookie-btn cookie-btn-decline">
                            {t.declineAll}
                        </button>
                        <button type="button" onClick={accept} className="cookie-btn cookie-btn-accept">
                            {t.acceptAll}
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
                                {t.settingsTitle}
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
                                    <h3 className="cookie-category-title">{t.essentialTitle}</h3>
                                    <span className="cookie-category-badge cookie-category-always">{t.essentialAlwaysActive}</span>
                                </div>
                                {expandedSection === "essential" && (
                                    <div className="cookie-category-content">
                                        <p className="cookie-category-desc">
                                            {t.essentialDesc}
                                        </p>
                                        <Link href={t.privacyPolicyLink} className="cookie-vendor-link">
                                            {t.viewVendorDetails}
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
                                    <h3 className="cookie-category-title">{t.analyticsTitle}</h3>
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
                                            {t.analyticsDesc}
                                        </p>
                                        <Link href={t.privacyPolicyLink} className="cookie-vendor-link">
                                            {t.viewVendorDetails}
                                        </Link>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="cookie-settings-footer">
                            <button type="button" onClick={handleSaveSettings} className="cookie-btn cookie-btn-accept cookie-btn-single">
                                {t.confirmChoices}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
