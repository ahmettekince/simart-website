"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { i18n, getLocaleDisplayName } from "@/config/i18n";
import { useLangStore } from "@/stores/langStore";

const languageOptions = [
    { id: "tr", label: "Türkçe" },
    { id: "en", label: "English" },
    { id: "ch", label: "Çince" },
];

export default function LanguageSelect({
    parentClassName = "image-select center style-default type-languages",
    topStart = false,
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { lang, setLang } = useLangStore();
    const [isDDOpen, setIsDDOpen] = useState(false);
    const languageSelect = useRef();

    // Dil bazlı seçili objeyi bul
    const selected = languageOptions.find(opt => opt.id === lang) || languageOptions[0];

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

        let newPathname = "";
        const segments = pathname.split("/").filter(Boolean);

        if (i18n.locales.includes(segments[0])) {
            if (newLocale === i18n.defaultLocale) {
                segments.shift();
            } else {
                segments[0] = newLocale;
            }
            newPathname = "/" + segments.join("/");
        } else {
            if (newLocale !== i18n.defaultLocale) {
                newPathname = "/" + newLocale + pathname;
            } else {
                newPathname = pathname;
            }
        }

        setLang(newLocale);
        setIsDDOpen(false);
        router.push(newPathname || "/");
    };

    return (
        <>
            <div
                className={`dropdown ${parentClassName}`}
                onClick={() => setIsDDOpen((pre) => !pre)}
                style={{ cursor: "pointer", position: "relative" }}
                ref={languageSelect}
            >
                <div
                    className={`btn-language-select ${isDDOpen ? "active" : ""}`}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: "500",
                        textTransform: "uppercase"
                    }}
                >
                    {lang}
                    <i className="icon icon-arrow-down" style={{ fontSize: "8px" }} />
                </div>

                <div
                    className={`dropdown-menu ${isDDOpen ? "show" : ""} `}
                    style={{
                        maxHeight: "300px",
                        overflow: "hidden",
                        minHeight: "auto",
                        position: "absolute",
                        top: "100%",
                        right: "0",
                        left: "auto",
                        margin: "10px 0 0 0",
                        display: isDDOpen ? "block" : "none",
                        background: "white",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        zIndex: 9999,
                        minWidth: "120px"
                    }}
                >
                    <div
                        className="inner show"
                        style={{
                            overflowY: "auto",
                        }}
                    >
                        <ul
                            className="dropdown-menu-list"
                            style={{
                                listStyle: "none",
                                margin: 0,
                                padding: "8px 0",
                                display: "block"
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
                                        padding: "8px 16px",
                                        cursor: "pointer",
                                        backgroundColor: lang === elm.id ? "#f3f4f6" : "transparent",
                                        transition: "background 0.2s"
                                    }}
                                    className={lang === elm.id ? "active" : ""}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = lang === elm.id ? "#f3f4f6" : "transparent"}
                                >
                                    <span style={{
                                        color: "#333",
                                        fontSize: "13px",
                                        fontWeight: lang === elm.id ? "600" : "400"
                                    }}>
                                        {elm.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
