"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { siteConfig } from "@/config/site";

const COOKIE_CONSENT = "cookie_consent";
const COOKIE_ANALYTICS = "cookie_consent_analytics";
const CONSENT_EVENT = "cookieConsentUpdated";

function loadGoogleAnalytics(measurementId) {
    if (typeof window === "undefined" || !measurementId || window.__gaLoaded) return;
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

function loadMetaPixel(pixelId) {
    if (typeof window === "undefined" || !pixelId || window.__fbLoaded) return;
    window.__fbLoaded = true;

    !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
}

function loadTikTokPixel(pixelId) {
    if (typeof window === "undefined" || !pixelId || window.__ttLoaded) return;
    window.__ttLoaded = true;

    // Kullanıcının istediği 3 saniyelik gecikme
    setTimeout(function () {
        !(function (w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = (w[t] = w[t] || []);
            ttq.methods = [
                "page",
                "track",
                "identify",
                "instances",
                "debug",
                "on",
                "off",
                "once",
                "ready",
                "alias",
                "group",
                "enableCookie",
                "disableCookie",
                "holdConsent",
                "revokeConsent",
                "grantConsent",
            ];
            ttq.setAndDefer = function (t, e) {
                t[e] = function () {
                    t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
            };
            for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
            ttq.load = function (e, n) {
                var r = "https://analytics.tiktok.com/i18n/pixel/events.js",
                    o = n && n.partner;
                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = r;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date();
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};
                var s = document.createElement("script");
                s.type = "text/javascript";
                s.async = !0;
                s.src = r + "?sdkid=" + e + "&lib=" + t;
                var m = document.getElementsByTagName("script")[0];
                m.parentNode.insertBefore(s, m);
            };
            ttq.load(pixelId);
            ttq.page();
        })(window, document, "ttq");
    }, 3000);
}

function loadGTM(gtmId) {
    if (typeof window === "undefined" || !gtmId || window.__gtmLoaded) return;
    window.__gtmLoaded = true;

    (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", gtmId);
}

export default function Analytics() {
    const pathname = usePathname();
    const prevPathRef = useRef(null);

    const tryLoadAll = () => {
        const consent = Cookies.get(COOKIE_CONSENT);
        const analytics = Cookies.get(COOKIE_ANALYTICS);

        if (consent === "accepted" && analytics === "true") {
            const { tracking } = siteConfig.site;

            if (tracking.googleAnalytics) loadGoogleAnalytics(tracking.googleAnalytics);
            if (tracking.metaPixel) loadMetaPixel(tracking.metaPixel);
            if (tracking.tiktokPixel) loadTikTokPixel(tracking.tiktokPixel);
            if (tracking.gtm) loadGTM(tracking.gtm);
        }
    };

    useEffect(() => {
        tryLoadAll();
        const handler = () => tryLoadAll();
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
