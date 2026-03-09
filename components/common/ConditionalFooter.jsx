"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footers/Footer";

const HIDE_FOOTER_PATHS = ["/sepetim", "/odeme", "/qr-", "/qr", "/kqr", "/3d"];

import { i18n } from "@/config/i18n";

export default function ConditionalFooter({ footerMenus, lang = "tr" }) {
    const pathname = usePathname();
    const hideFooter = HIDE_FOOTER_PATHS.some((path) => {
        // Prefix varsa onu temizleyip kontrol et
        const cleanPath = i18n.locales.includes(pathname.split("/").filter(Boolean)[0])
            ? pathname.replace(/^\/[^\/]+/, "") || "/"
            : pathname;
        return cleanPath.startsWith(path);
    });

    if (hideFooter) return null;

    return <Footer footerMenus={footerMenus} lang={lang} />;
}
