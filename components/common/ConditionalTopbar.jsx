"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Topbar from "@/components/headers/Topbar";

const HIDE_TOPBAR_PATHS = ["/odeme"];
const MOBILE_BREAKPOINT_PX = 768;

/** Ürün detay sayfası: /magaza/[kategori]/[urun] (en az 3 segment) */
function isProductDetailPage(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 3 && segments[0] === "magaza";
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

  const hideByPath = HIDE_TOPBAR_PATHS.some((path) => pathname === path);
  const hideByProductDetail = isProductDetailPage(pathname) && isMobile;
  const hideTopbar = hideByPath || hideByProductDetail;

  if (hideTopbar) return null;

  return <Topbar data={data} isActive={isActive} />;
}
