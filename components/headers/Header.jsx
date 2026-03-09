import React from "react";
import Nav from "@/components/headers/Nav";
import Image from "next/image";
import Link from "next/link";
import CartLength from "@/components/common/CartLength";
import MobileMenu from "@/components/modals/MobileMenu";
import AccountIcon from "@/components/headers/AccountIcon";
import { getMenus } from "@/api/menus";
import SimartLogo from "@/components/common/SimartLogo";

import { getLocalizedUrl } from "@/utils/i18n";

export default async function Header({
  textClass,
  bgColor = "",
  uppercase = false,
  isArrow = true,
  Linkfs = "",
  menuItems = [],
  lang = "tr", // lang prop eklendi
}) {
  const activeMenuItems =
    menuItems && menuItems.length > 0 ? menuItems : await getMenus(lang);

  // Kurumsal menü sıralaması... (aynı mantık devam)
  const corporateOrder = [
    "hikayemiz",
    "kilometre-taslari",
    "sertifikalar",
    "odullerimiz",
    "etkinliklerimiz",
    "basinda-biz",
    "kariyer",
  ];

  const resolvedMenuItems = activeMenuItems.map((item) => {
    // URL'leri yerelleştir
    const localizedUrl = getLocalizedUrl(item.url, lang);
    const localizedChildren = item.children?.map(child => ({
      ...child,
      url: getLocalizedUrl(child.url, lang)
    }));

    // Kurumsal sıralama mantığını koru ama urlleri de güncellemiş olalım
    if (item.children && item.children.some((c) => c.url?.includes("hikayemiz"))) {
      const sortedChildren = [...(localizedChildren || [])].sort((a, b) => {
        const getSlug = (url) => {
          if (!url) return "";
          const parts = url.split("/").filter(Boolean);
          // Eğer en başta dil prefixi varsa (en/kurumsal/hikayemiz), onu atlayıp slug'ı bul
          const filteredParts = parts.filter(p => !i18n.locales.includes(p));
          return filteredParts[filteredParts.length - 1];
        };

        const slugA = getSlug(a.url);
        const slugB = getSlug(b.url);

        const indexA = corporateOrder.indexOf(slugA);
        const indexB = corporateOrder.indexOf(slugB);

        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;

        return valA - valB;
      });

      return { ...item, url: localizedUrl, children: sortedChildren };
    }
    return { ...item, url: localizedUrl, children: localizedChildren };
  });

  return (
    <>
      <header
        id="header"
        className={`header-default ${uppercase ? "header-uppercase" : ""}`}
      >
        <div className="px_15 lg-px_40">
          <div className="row wrapper-header align-items-center">
            {/* ... (mobile menu toggle) */}
            <div className="col-md-4 col-3 tf-lg-hidden">
              <a
                href="#mobileMenu"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={16}
                  viewBox="0 0 24 16"
                  fill="none"
                >
                  <path
                    d="M2.00056 2.28571H16.8577C17.1608 2.28571 17.4515 2.16531 17.6658 1.95098C17.8802 1.73665 18.0006 1.44596 18.0006 1.14286C18.0006 0.839753 17.8802 0.549063 17.6658 0.334735C17.4515 0.120408 17.1608 0 16.8577 0H2.00056C1.69745 0 1.40676 0.120408 1.19244 0.334735C0.978109 0.549063 0.857702 0.839753 0.857702 1.14286C0.857702 1.44596 0.978109 1.73665 1.19244 1.95098C1.40676 2.16531 1.69745 2.28571 2.00056 2.28571ZM0.857702 8C0.857702 7.6969 0.978109 7.40621 1.19244 7.19188C1.40676 6.97755 1.69745 6.85714 2.00056 6.85714H22.572C22.8751 6.85714 23.1658 6.97755 23.3801 7.19188C23.5944 7.40621 23.7148 7.6969 23.7148 8C23.7148 8.30311 23.5944 8.59379 23.3801 8.80812C23.1658 9.02245 22.8751 9.14286 22.572 9.14286H2.00056C1.69745 9.14286 1.40676 9.02245 1.19244 8.80812C0.978109 8.59379 0.857702 8.30311 0.857702 8ZM0.857702 14.8571C0.857702 14.554 0.978109 14.2633 1.19244 14.049C1.40676 13.8347 1.69745 13.7143 2.00056 13.7143H12.2863C12.5894 13.7143 12.8801 13.8347 13.0944 14.049C13.3087 14.2633 13.4291 14.554 13.4291 14.8571C13.4291 15.1602 13.3087 15.4509 13.0944 15.6653C12.8801 15.8796 12.5894 16 12.2863 16H2.00056C1.69745 16 1.40676 15.8796 1.19244 15.6653C0.978109 15.4509 0.857702 15.1602 0.857702 14.8571Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <div className="col-xl-3 col-md-4 col-6">
              <Link href={getLocalizedUrl("/", lang)} className="logo-header">
                <SimartLogo width="136" height="21" className="logo" />
              </Link>
            </div>
            <div className="col-xl-6 tf-md-hidden">
              <nav className="box-navigation text-center">
                <ul className="box-nav-ul d-flex align-items-center justify-content-center gap-30">
                  <Nav
                    isArrow={isArrow}
                    Linkfs={Linkfs}
                    menuItems={resolvedMenuItems}
                    lang={lang}
                  />

                </ul>
              </nav>
            </div>
            <div className="col-xl-3 col-md-4 col-3">
              <ul className="nav-icon d-flex justify-content-end align-items-center gap-20">
                <li className="nav-search">
                  <a
                    href="#canvasSearch"
                    data-bs-toggle="offcanvas"
                    aria-controls="offcanvasLeft"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-search" />
                  </a>
                </li>
                <li className="nav-account">
                  <AccountIcon lang={lang} />
                </li>

                <li className="nav-cart">
                  <a
                    href="#shoppingCart"
                    data-bs-toggle="modal"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-bag" />
                    <span className={`count-box ${bgColor}`}>
                      <CartLength />
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu menuItems={resolvedMenuItems} lang={lang} />
    </>
  );
}
