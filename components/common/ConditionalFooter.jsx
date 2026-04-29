"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footers/Footer";
import { i18n } from "@/config/i18n";

const HIDE_FOOTER_PATHS = [
    "/sepetim",
    "/cart",
    "/odeme",
    "/checkout",
    "/qr-",
    "/qr",
    "/kqr",
    "/robot-supurge-secim-rehberi",
    "/en/checkout",
    "/en/cart",
    "/en/qr",
    "/en/robot-supurge-secim-rehberi"
];

export default function ConditionalFooter({ footerMenus, lang = "tr" }) {
    const pathname = usePathname();

    // Pathname'den dili temizle
    const cleanPath = i18n.locales.includes(pathname.split("/").filter(Boolean)[0])
        ? pathname.replace(/^\/[^\/]+/, "") || "/"
        : pathname;

    const hideFooter = HIDE_FOOTER_PATHS.some((path) => {
        return pathname.startsWith(path) || cleanPath.startsWith(path);
    });

    if (hideFooter) return null;

    return <Footer footerMenus={footerMenus} lang={lang} />;
}
