"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { siteConfig } from "@/config/site";

const COOKIE_CONSENT = "cookie_consent";
const COOKIE_ANALYTICS = "cookie_consent_analytics";
const CONSENT_EVENT = "cookieConsentUpdated";

export default function Analytics() {
    const pathname = usePathname();
    const prevPathRef = useRef(null);

    // İlk yüklemede ve çerez değiştiğinde GTM onayını güncelle
    const tryUpdateConsent = () => {
        const consent = Cookies.get(COOKIE_CONSENT);
        const analytics = Cookies.get(COOKIE_ANALYTICS);

        if (consent === "accepted" && analytics === "true") {
            if (typeof window !== "undefined" && window.gtag) {
                window.gtag("consent", "update", {
                    ad_storage: "granted",
                    ad_user_data: "granted",
                    ad_personalization: "granted",
                    analytics_storage: "granted",
                });
                window.dataLayer.push({ event: "consent_initialized", analytics_enabled: true });
            }
        }
    };

    useEffect(() => {
        tryUpdateConsent();
        const handler = () => tryUpdateConsent();
        window.addEventListener(CONSENT_EVENT, handler);
        return () => window.removeEventListener(CONSENT_EVENT, handler);
    }, []);

    // SPA route değişiminde page_view
    useEffect(() => {
        const path = pathname || window.location.pathname;
        if (prevPathRef.current !== null && prevPathRef.current !== path) {
            // GA Page View
            if (window.gtag) {
                window.gtag("event", "page_view", { page_path: path });
            }
            // Meta Pixel Page View
            if (window.fbq) {
                window.fbq("track", "PageView");
            }
            // TikTok Page View
            if (window.ttq) {
                window.ttq.page();
            }
        }
        prevPathRef.current = path;
    }, [pathname]);

    return null;
}
