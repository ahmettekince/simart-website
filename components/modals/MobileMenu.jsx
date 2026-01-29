"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";
import { useAuthStore } from "@/stores/authStore";
import { openCartModal } from "@/utils/openCartModal";

export default function MobileMenu({ menuItems: initialMenuItems = [] }) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/customer/logout");
      logout();
      // Cookie cleanup
      document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/giris-yap";
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie = "_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "_token=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/giris-yap";
    }
  };

  useEffect(() => {
    if (initialMenuItems.length === 0) {
      const fetchMenu = async () => {
        try {
          const response = await apiClient.get("/menus?type=header-menu");
          if (response.data?.status === "success" && Array.isArray(response.data.data?.items)) {
            setMenuItems(response.data.data.items);
          } else {
            log("[MobileMenu.jsx] Menu API response invalid:", response?.data);
          }
        } catch (error) {
          log("[MobileMenu.jsx] Failed to fetch menu:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
          });
          // Hata durumunda menuItems boş kalır, bu yüzden render edilmez
        }
      };
      fetchMenu();
    } else {
      setMenuItems(initialMenuItems);
    }
  }, [initialMenuItems]);

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

    const isHome = pathToCheck === "/" || pathToCheck === "";
    const isCurrentHome = pathname === "/";
    if (isHome) return isCurrentHome;

    const isActive = pathToCheck !== "/" && pathname.startsWith(pathToCheck);
    if (isActive) return true;

    if (menuItem.children && menuItem.children.length) {
      return menuItem.children.some((child) => isMenuActive(child));
    }

    return false;
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
            <Link href={item.url || "#"} className={`mb-menu-link ${isMenuActive(item) ? "activeMenu" : ""}`}>
              {item.title}
            </Link>
          )}
        </li>
      );
    });
  };

  return (
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
              <Link href={`/destek`} className="text-need">
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
            <a href="#" onClick={handleLogout} className="site-nav-icon">
              <i className="icon icon-account" />
              Çıkış Yap
            </a>
          ) : (
            <Link href={`/giris-yap`} className="site-nav-icon">
              <i className="icon icon-account" />
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
