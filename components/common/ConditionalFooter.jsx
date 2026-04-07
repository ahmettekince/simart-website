"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footers/Footer";
import { i18n } from "@/config/i18n";

const HIDE_FOOTER_PATHS = ["/sepetim", "/odeme", "/qr-", "/qr", "/kqr", "/3d", "/checkout", "/en/checkout", "/en/qr-", "/en/qr", "/en/3d"];

export default function ConditionalFooter({ footerMenus, lang = "tr" }) {
    const pathname = usePathname();
    const hideFooter = HIDE_FOOTER_PATHS.some((path) => {
        // Prefix varsa onu temizleyip kontrol et
        const cleanPath = i18n.locales.includes(pathname.split("/").filter(Boolean)[0])
            ? pathname.replace(/^\/[^\/]+/, "") || "/"
            : pathname;
        return pathname.startsWith(path) || cleanPath.startsWith(path);
    });

    if (hideFooter) return null;

    return <Footer footerMenus={footerMenus} lang={lang} />;
}
