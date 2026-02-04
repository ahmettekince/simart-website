"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const accountLinks = [
  { href: "/hesabim", label: "Hesabım" },
  { href: "/siparislerim", label: "Siparişlerim" },
  { href: "/adreslerim", label: "Adreslerim" },
  { href: "/kupon-kodlarim", label: "Kupon Kodlarım" },
  { href: "/paylas-simart", label: "Paylaş Şımart" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const doLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await apiClient.post("/customer/logout");
      if (response.data?.status === "success" || response.status === 200) {
        logout();
        document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/giris-yap";
        return;
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/giris-yap";
      return;
    }
    setIsLoggingOut(false);
  };

  return (
    <>
      <ul className="my-account-nav">
        {accountLinks.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className={`my-account-nav-item ${pathname == link.href ? "active" : ""
                }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); if (!isLoggingOut) setShowLogoutConfirm(true); }}
            className="my-account-nav-item"
            style={{ cursor: isLoggingOut ? "wait" : "pointer" }}
          >
            {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </a>
        </li>
      </ul>

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "320px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "30px 25px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "10px", color: "#333", fontWeight: "700" }}>
              {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış yapmak istiyor musunuz?"}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
              <button
                onClick={doLogout}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: isLoggingOut ? "#999" : "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoggingOut ? "wait" : "pointer",
                }}
              >
                Evet, Çıkış Yap
              </button>
              <button
                onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                }}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
