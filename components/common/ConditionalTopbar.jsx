"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Topbar from "@/components/headers/Topbar";
import { i18n } from "@/config/i18n";

const HIDE_TOPBAR_PATHS = ["/odeme", "/qr-", "/qr", "/kqr", "/robot-supurge-secim-rehberi", "/checkout", "/en/checkout", "/en/qr-", "/en/qr", "/en/3d"];
const MOBILE_BREAKPOINT_PX = 768;

function isProductDetailPage(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return false;

  // Eğer ilk segment dil prefixi ise onu atla
  const startIndex = i18n.locales.includes(segments[0]) ? 1 : 0;

  return segments.length >= startIndex + 3 && segments[startIndex] === "magaza";
}

export default function ConditionalTopbar({ data, isActive }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const hideByPath = HIDE_TOPBAR_PATHS.some((path) => {
    // Prefix varsa onu temizleyip kontrol et
    const cleanPath = i18n.locales.includes(pathname.split("/").filter(Boolean)[0])
      ? pathname.replace(/^\/[^\/]+/, "") || "/"
      : pathname;
    return pathname.startsWith(path) || cleanPath.startsWith(path);
  });
  const hideByProductDetail = isProductDetailPage(pathname) && isMobile;
  const hideTopbar = hideByPath || hideByProductDetail;

  if (hideTopbar) return null;

  return <Topbar data={data} isActive={isActive} />;
}
