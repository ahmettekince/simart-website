"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import log from "@/utils/logger";
import apiClient from "@/utils/apiClient";
import { openCartModal } from "@/utils/openCartModal";
import { getLocalizedUrl } from "@/utils/i18n";

export default function MobileMenu({ menuItems: initialMenuItems = [], lang = "tr" }) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();

  const doLogout = async (e) => {
    if (e) e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const loginUrl = getLocalizedUrl("/giris-yap", lang);
    try {
      await apiClient.post("/customer/logout");
      logout();
      document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = loginUrl;
      return;
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = loginUrl;
      return;
    }
  };

  useEffect(() => {
    setMenuItems(initialMenuItems);
  }, [initialMenuItems]);

  // ... (closeOffcanvas effect)
  const isMenuActive = (menuItem) => {
    const url = menuItem.url || "";
    if (!url || url === "#") return false;

    let pathToCheck = url;
    try {
      if (url.startsWith("http")) {
        pathToCheck = new URL(url).pathname;
      }
    } catch (e) {
      pathToCheck = url;
    }

    const isHome = pathToCheck === "/" || pathToCheck === "" || pathToCheck === `/${lang}` || pathToCheck === `/${lang}/`;
    if (isHome) return pathname === "/" || pathname === `/${lang}` || pathname === `/${lang}/`;

    const isActive = pathToCheck !== "/" && pathname.startsWith(pathToCheck);
    if (isActive) return true;

    if (menuItem.children && menuItem.children.length) {
      return menuItem.children.some((child) => isMenuActive(child));
    }

    return false;
  };

  const closeMenu = () => {
    if (typeof window !== "undefined") {
      try {
        const bootstrap = require("bootstrap");
        const mobileMenuElement = document.getElementById("mobileMenu");
        if (mobileMenuElement) {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(mobileMenuElement);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          } else {
            const closeBtn = mobileMenuElement.querySelector('[data-bs-dismiss="offcanvas"]');
            if (closeBtn) closeBtn.click();
          }
        }

        setTimeout(() => {
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          const backdrops = document.querySelectorAll(".offcanvas-backdrop");
          backdrops.forEach(backdrop => backdrop.remove());
        }, 300);
      } catch (error) {
        console.error("Menu kapatma hatası:", error);
      }
    }
  };

  const renderMenuItems = (items, level = 1) => {
    return items.map((item, index) => {
      const id = `menu-${level}-${index}`;
      const hasChildren = item.children && item.children.length > 0;

      return (
        <li key={index} className="nav-mb-item">
          {hasChildren ? (
            <>
              <a
                href={`#${id}`}
                className={`collapsed mb-menu-link ${isMenuActive(item) ? "activeMenu" : ""}`}
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls={id}
              >
                <span>{item.title}</span>
                <span className="btn-open-sub" />
              </a>
              <div id={id} className="collapse">
                <ul className={`sub-nav-menu ${level > 1 ? "sub-menu-level-2" : ""}`}>
                  {renderMenuItems(item.children, level + 1)}
                </ul>
              </div>
            </>
          ) : (
            <Link
              href={item.url || "#"}
              className={`mb-menu-link ${isMenuActive(item) ? "activeMenu" : ""}`}
              onClick={closeMenu}
            >
              {item.title}
            </Link>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
        <span className="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close" />
        <div className="mb-canvas-content">
          <div className="mb-body">
            <ul className="nav-ul-mb" id="wrapper-menu-navigation">
              {renderMenuItems(menuItems)}
            </ul>
            <div className="mb-other-content">
              <div className="d-flex group-icon">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openCartModal();
                  }}
                  className="site-nav-icon"
                >
                  <i className="icon icon-cart" />
                  Sepetim
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Mobil menü modal'ını kapat
                    if (typeof window !== "undefined") {
                      const bootstrap = require("bootstrap");
                      const mobileMenuOffcanvas = document.getElementById("mobileMenu");
                      if (mobileMenuOffcanvas) {
                        const offcanvasInstance = bootstrap.Offcanvas.getInstance(mobileMenuOffcanvas);
                        if (offcanvasInstance) {
                          offcanvasInstance.hide();
                        }
                      }
                      // Arama modal'ını aç
                      setTimeout(() => {
                        const searchOffcanvas = document.getElementById("canvasSearch");
                        if (searchOffcanvas) {
                          const searchInstance = new bootstrap.Offcanvas(searchOffcanvas);
                          searchInstance.show();
                        }
                      }, 300);
                    }
                  }}
                  className="site-nav-icon"
                >
                  <i className="icon icon-search" />
                  Ara
                </a>
              </div>
              <div className="mb-notice">
                <Link href={getLocalizedUrl("/destek", lang)} className="text-need" onClick={closeMenu}>
                  Yardıma mı ihtiyacınız var?
                </Link>
              </div>
              <div style={{ marginTop: "20px", marginBottom: "15px" }}>

                <ul className="mb-info">
                  <li>
                    Adres: Yeşilova Mah. 4023 Cad. <br /> Ser Tower Apt. Dış Kapı: 1 G Etimesgut/Ankara
                  </li>
                  <li>
                    Email: <a href="mailto:destek@simart.me" style={{ color: "inherit", textDecoration: "none" }}><b>destek@simart.me</b></a>
                  </li>
                  <li>
                    Phone: <a href="tel:+908503466126" style={{ color: "inherit", textDecoration: "none" }}><b>+90 850 346 6126</b></a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mb-bottom">
            {isAuthenticated ? (
              <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutConfirm(true); }} className="site-nav-icon">
                <i className="icon icon-account" />
                Çıkış Yap
              </a>
            ) : (
              <Link href={getLocalizedUrl("/giris-yap", lang)} className="site-nav-icon" onClick={closeMenu}>
                <i className="icon icon-account" />
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>

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
