"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footers/Footer";

const HIDE_FOOTER_PATHS = ["/sepetim", "/odeme", "/qr-", "/qr", "/kqr"];

export default function ConditionalFooter({ footerMenus }) {
    const pathname = usePathname();
    const hideFooter = HIDE_FOOTER_PATHS.some((path) => pathname.startsWith(path));

    if (hideFooter) return null;

    return <Footer footerMenus={footerMenus} />;
}
