"use client";

import { usePathname } from "next/navigation";
import { i18n } from "@/config/i18n";

const HIDE_HEADER_PATHS = [
    "/odeme", 
    "/checkout",
    "/qr", 
    "/3d", 
    "/en/checkout", 
    "/en/qr", 
    "/en/3d",
    "/sepetim",
    "/cart",
    "/en/cart"
];

export default function ConditionalHeader({ children }) {
    const pathname = usePathname();

    const hideByPath = HIDE_HEADER_PATHS.some((path) => {
        const cleanPath = i18n.locales.includes(pathname.split("/").filter(Boolean)[0])
            ? pathname.replace(/^\/[^\/]+/, "") || "/"
            : pathname;
        return pathname.startsWith(path) || cleanPath.startsWith(path);
    });

    if (hideByPath) return null;

    return <>{children}</>;
}
