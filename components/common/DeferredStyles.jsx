"use client";

import { useEffect } from "react";

/**
 * Kritik olmayan CSS'leri render'ı bloklamadan yükler.
 * media="print" + onload="this.media='all'" ile tarayıcı ilk çizimi bekletmez.
 */
const DEFERRED_CSS = [
  "/css/swiper-bundle.min.css",
  "/css/animate.css",
  "/fonts/fonts.css",
  "/fonts/font-icons.css",
];

export default function DeferredStyles() {
  useEffect(() => {
    DEFERRED_CSS.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.media = "print";
      link.onload = () => {
        link.media = "all";
      };
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
