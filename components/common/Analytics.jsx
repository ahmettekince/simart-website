"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

const COOKIE_CONSENT = "cookie_consent";
const COOKIE_ANALYTICS = "cookie_consent_analytics";
const CONSENT_EVENT = "cookieConsentUpdated";

function loadGoogleAnalytics(measurementId) {
    if (typeof window === "undefined" || !measurementId) return;
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
        send_page_view: true,
        anonymize_ip: true,
    });
}

export default function Analytics() {
    const pathname = usePathname();
    const prevPathRef = useRef(null);

    const tryLoad = () => {
        const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (!measurementId) return;
        const consent = Cookies.get(COOKIE_CONSENT);
        const analytics = Cookies.get(COOKIE_ANALYTICS);
        if (consent === "accepted" && analytics === "true") {
            loadGoogleAnalytics(measurementId);
        }
    };

    useEffect(() => {
        tryLoad();
        const handler = () => tryLoad();
        window.addEventListener(CONSENT_EVENT, handler);
        return () => window.removeEventListener(CONSENT_EVENT, handler);
    }, []);

    // SPA route değişiminde page_view (ilk yüklemede config zaten gönderiyor)
    useEffect(() => {
        if (typeof window === "undefined" || !window.gtag) return;
        const path = pathname || window.location.pathname;
        if (prevPathRef.current !== null && prevPathRef.current !== path) {
            window.gtag("event", "page_view", { page_path: path });
        }
        prevPathRef.current = path;
    }, [pathname]);

    return null;
}
