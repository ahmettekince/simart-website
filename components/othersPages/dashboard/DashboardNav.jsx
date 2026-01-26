"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const accountLinks = [
  { href: "/hesabim", label: "Hesabım" },
  { href: "/my-account-orders", label: "Siparişlerim" },
  { href: "/adreslerim", label: "Adreslerim" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async (e) => {
    e.preventDefault();
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const response = await apiClient.post("/customer/logout");
      if (response.data?.status === "success" || response.status === 200) {
        // Auth state'ini temizle
        logout();

        // Cookie'yi her türlü ihtimale karşı temizle
        document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Giriş sayfasına yönlendir
        window.location.href = "/giris-yap";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Hata olsa bile kullanıcıyı yönlendirmek daha iyi olabilir
      window.location.href = "/giris-yap";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
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
          onClick={handleLogout}
          className="my-account-nav-item"
          style={{ cursor: isLoggingOut ? "wait" : "pointer" }}
        >
          {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
        </a>
      </li>
    </ul>
  );
}
