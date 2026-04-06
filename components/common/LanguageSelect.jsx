"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { i18n, getLocaleDisplayName } from "@/config/i18n";
import { useLangStore } from "@/stores/langStore";
import { translatePath } from "@/utils/i18n";

const languageOptions = [
    { id: "tr", label: "Türkçe" },
    { id: "en", label: "English" },
];

export default function LanguageSelect({
    parentClassName = "image-select center style-default type-languages",
    topStart = false,
    textColor = "currentColor",
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { lang, setLang } = useLangStore();
    const [isDDOpen, setIsDDOpen] = useState(false);
    const languageSelect = useRef();

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

        const newPathname = translatePath(pathname, newLocale);
        setLang(newLocale);
        setIsDDOpen(false);
        router.push(newPathname);
    };

    return (
        <div
            className={`dropdown ${parentClassName}`}
            ref={languageSelect}
            style={{ position: "relative" }}
        >
            <div
                className={`btn-language-select ${isDDOpen ? "active" : ""}`}
                onClick={() => setIsDDOpen((pre) => !pre)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: textColor,
                    fontSize: "13px",
                    fontWeight: "600",
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

            <div
                className={`dropdown-menu ${isDDOpen ? "show" : ""} `}
                style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    left: "auto",
                    margin: "8px 0 0 0",
                    display: isDDOpen ? "block" : "none",
                    background: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    zIndex: 9999,
                    minWidth: "120px",
                    padding: "6px",
                    animation: "fadeInUp 0.2s ease-out"
                }}
            >
                <ul
                    style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {languageOptions.map((elm, i) => (
                        <li
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLanguageChange(elm.id);
                            }}
                            style={{
                                padding: "10px 14px",
                                cursor: "pointer",
                                backgroundColor: lang === elm.id ? "#f8f9fa" : "transparent",
                                transition: "all 0.2s ease",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = lang === elm.id ? "#f8f9fa" : "transparent"}
                        >
                            <span style={{
                                color: "#111",
                                fontSize: "14px",
                                fontWeight: lang === elm.id ? "600" : "500"
                            }}>
                                {elm.label}
                            </span>
                            {lang === elm.id && (
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#e21e25" }} />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
