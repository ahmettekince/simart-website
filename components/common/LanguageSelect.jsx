"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { i18n, getLocaleDisplayName } from "@/config/i18n";
import { useLangStore } from "@/stores/langStore";
import { useCartStore } from "@/stores/cartStore";
import { translatePath } from "@/utils/i18n";

const languageOptions = [
    { id: "tr", label: "TR" },
    { id: "en", label: "EN" },
];

export default function LanguageSelect({
    parentClassName = "image-select center style-default type-languages",
    topStart = false,
    textColor = "currentColor",
    isMobileMenu = false,
    isFlow = false, // Flow mode: Açılınca elemenları aşağı iter (yüzmez)
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { lang, setLang, alternatePaths } = useLangStore();
    const fetchCart = useCartStore((s) => s.fetchCart);
    const [isDDOpen, setIsDDOpen] = useState(false);
    const languageSelect = useRef();

    // URL'deki dili store ile senkronize et
    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean);
        const localeInUrl = segments[0];

        if (i18n.locales.includes(localeInUrl)) {
            if (lang !== localeInUrl) {
                setLang(localeInUrl);
            }
        } else {
            if (lang !== i18n.defaultLocale) {
                setLang(i18n.defaultLocale);
            }
        }
    }, [pathname, lang, setLang]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                languageSelect.current &&
                !languageSelect.current.contains(event.target)
            ) {
                setIsDDOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (newLocale) => {
        if (newLocale === lang) {
            setIsDDOpen(false);
            return;
        }

        // Dil tercihini hatırla (Cookie)
        if (typeof document !== "undefined") {
            const expires = new Date();
            expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 yıl
            const secure = window.location.protocol === "https:" ? ";Secure" : "";

            // Olası çerez çakışmalarını temizle ve yenisini yaz
            document.cookie = `NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires.toUTCString()};path=/;SameSite=Lax${secure}`;
        }

        // Yönlendirme hedefi
        let targetPath = alternatePaths?.[newLocale] || translatePath(pathname, newLocale);

        // Eğer hedef belirlenemezse ana sayfaya git
        if (!targetPath || targetPath === "/" || targetPath === `/${newLocale}`) {
            targetPath = newLocale === i18n.defaultLocale ? "/" : `/${newLocale}`;
        }

        setIsDDOpen(false);
        // FULL REFRESH: Sunucu tarafındaki Middleware'in yeni çerezi kesin görmesi için
        window.location.href = targetPath;
    };

    return (
        <div
            className={`dropdown ${parentClassName}`}
            ref={languageSelect}
            style={{ position: "relative", width: "auto" }}
        >
            <div
                className={`btn-language-select ${isDDOpen ? "active" : ""}`}
                onClick={() => setIsDDOpen((pre) => !pre)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: textColor,
                    fontSize: "13px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    transition: "all 0.2s ease"
                }}
            >
                {lang}
                <i className={`icon icon-arrow-down`} style={{ fontSize: "8px", transition: "transform 0.2s", transform: isDDOpen ? "rotate(180deg)" : "rotate(0)" }} />
            </div>

            {isDDOpen && (
                <div
                    className={`dropdown-menu show`}
                    style={{
                        position: "absolute",
                        top: "100%",
                        right: "0",
                        left: "auto",
                        marginTop: "8px",
                        background: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        zIndex: 9999,
                        minWidth: "60px",
                        width: "max-content",
                        padding: "4px",
                        animation: "fadeIn 0.2s ease-out"
                    }}
                >
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {languageOptions.map((elm, i) => (
                            <li
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLanguageChange(elm.id);
                                }}
                                style={{
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    backgroundColor: lang === elm.id ? "#f8f9fa" : "transparent",
                                    transition: "all 0.2s ease",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                <span style={{
                                    color: "#111",
                                    fontSize: "13px",
                                    fontWeight: lang === elm.id ? "700" : "500",
                                }}>
                                    {elm.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
