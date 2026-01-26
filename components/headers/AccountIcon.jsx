"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

export default function AccountIcon() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return (
    <div className="nav-icon-item" style={{ opacity: 0.5 }}>
      <i className="icon icon-account" />
    </div>
  );

  return (
    <Link href={isAuthenticated ? "/hesabim" : "/giris-yap"} className="nav-icon-item">
      <i className="icon icon-account" />
    </Link>
  );
}
