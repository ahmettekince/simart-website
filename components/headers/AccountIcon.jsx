"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

import { getLocalizedUrl } from "@/utils/i18n";

export default function AccountIcon({ lang = "tr" }) {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return (
    <div className="nav-icon-item" style={{ opacity: 0.5 }}>
      <i className="icon icon-account" />
    </div>
  );

  return (
    <Link href={getLocalizedUrl(isAuthenticated ? "/hesabim" : "/giris-yap", lang)} className="nav-icon-item">
      <i className="icon icon-account" />
    </Link>
  );
}
