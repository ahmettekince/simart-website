import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AppStoreButtons({ lang = "tr" }) {
    const t = {
        tr: {
            appstore_sub: "App Store",
            appstore_name: " 'dan indirin",
            googleplay_sub: "Google Play",
            googleplay_name: " 'den indirin"
        },
        en: {
            appstore_sub: "Download on the",
            appstore_name: "App Store",
            googleplay_sub: "GET IT ON",
            googleplay_name: "Google Play"
        }
    }[lang] || {
        appstore_sub: "App Store",
        appstore_name: " 'dan indirin",
        googleplay_sub: "Google Play",
        googleplay_name: " 'den indirin"
    };

    return (
        <div className="footer-apps">
            {/* App Store Button */}
            {siteConfig.apps?.appStore && (
                <a
                    href={siteConfig.apps.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn"
                >
                    <div className="app-icon">
                        <svg viewBox="0 0 384 512" width="24" height="24" fill="currentColor">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                        </svg>
                    </div>
                    <div className="app-text">
                        <span className="app-sub">{t.appstore_sub}</span>
                        <span className="app-name">{t.appstore_name}</span>
                    </div>
                </a>
            )}

            {/* Google Play Button */}
            {siteConfig.apps?.googlePlay && (
                <a
                    href={siteConfig.apps.googlePlay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn"
                >
                    <div className="app-icon">
                        <svg viewBox="0 0 512 512" width="24" height="24">
                            <path
                                fill="#00d7ff"
                                d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"
                            />
                            <path
                                fill="#ffbe00"
                                d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"
                            />
                            <path
                                fill="#00f076"
                                d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"
                            />
                            <path
                                fill="#ff1900"
                                d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"
                            />
                        </svg>
                    </div>
                    <div className="app-text">
                        <span className="app-sub">{t.googleplay_sub}</span>
                        <span className="app-name">{t.googleplay_name}</span>
                    </div>
                </a>
            )}
        </div>
    );
}
