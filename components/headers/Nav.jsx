"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";
import { ProductCard } from "../../otherpagesinveriler/shopCards/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { products1 } from "@/data/products";

export default function Nav({ isArrow = true, textColor = "", Linkfs = "", menuItems: initialMenuItems = [] }) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  useEffect(() => {
    // Eğer dışarıdan hazır menü gelirse onu kullan
    if (initialMenuItems && initialMenuItems.length > 0) {
      setMenuItems(initialMenuItems);
      return;
    }

    // Eğer dışarıdan menü gelmiyorsa ve biz henüz çekmemişsek (state boşsa) API'den çek
    if (menuItems.length === 0) {
      const fetchMenu = async () => {
        try {
          const response = await apiClient.get("/menus?type=header-menu");
          if (response.data?.status === "success" && Array.isArray(response.data.data?.items)) {
            setMenuItems(response.data.data.items);
          } else {
            log("[Nav.jsx] Menu API response invalid:", response?.data);
          }
        } catch (error) {
          log("[Nav.jsx] Failed to fetch menu:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
          });
          // Hata durumunda menuItems boş kalır, bu yüzden render edilmez
        }
      };
      fetchMenu();
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

  return (
    <>
      {menuItems.map((item, index) => {
        const isProductsMenu =
          item.title === "Ürünler" || item.title === "Products" || item.css_class?.includes("mega-menu");

        return (
          <li key={index} className={`menu-item ${isProductsMenu ? "" : "position-relative"}`}>
            <Link
              href={item.url || "#"}
              target={item.target || "_self"}
              className={`item-link ${Linkfs} ${textColor} ${isMenuActive(item) ? "activeMenu" : ""} ${
                item.css_class || ""
              }`}
            >
              {item.title}
              {item.children?.length > 0 && isArrow && <i className="icon icon-arrow-down" />}
            </Link>

            {item.children?.length > 0 && (
              <div className={`sub-menu ${isProductsMenu ? "mega-menu" : "submenu-default"}`}>
                {isProductsMenu ? (
                  <div className="container">
                    <div className="row">
                      {(() => {
                        const chunkSize = 10;
                        const chunks = [];
                        for (let i = 0; i < item.children.length; i += chunkSize) {
                          chunks.push(item.children.slice(i, i + chunkSize));
                        }

                        return chunks.map((chunk, chunkIndex) => (
                          <div key={chunkIndex} className="col-lg-2">
                            <div className="mega-menu-item">
                              <div className="menu-heading">{chunkIndex === 0 ? item.title : " "}</div>
                              <ul className="menu-list">
                                {chunk.map((subItem, subIndex) => (
                                  <li key={subIndex}>
                                    <Link
                                      href={subItem.url || "#"}
                                      target={subItem.target || "_self"}
                                      className={`menu-link-text link ${isMenuActive(subItem) ? "activeMenu" : ""} ${
                                        subItem.css_class || ""
                                      }`}
                                    >
                                      {subItem.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ));
                      })()}
                      <div className="col-lg-10">
                        <div className="menu-heading">En iyi satanlar</div>
                        <div className="hover-sw-nav hover-sw-2">
                          <Swiper
                            dir="ltr"
                            modules={[Navigation]}
                            navigation={{
                              prevEl: ".snmpn1",
                              nextEl: ".snmnn1",
                            }}
                            slidesPerView={5}
                            spaceBetween={15}
                            className="swiper tf-product-header wrap-sw-over"
                          >
                            {[...products1].slice(0, 10).map((elm, i) => (
                              <SwiperSlide key={i} className="swiper-slide">
                                <ProductCard product={elm} />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                          <div className="nav-sw nav-next-slider nav-next-product-header box-icon w_46 round snmpn1">
                            <span className="icon icon-arrow-left" />
                          </div>
                          <div className="nav-sw nav-prev-slider nav-prev-product-header box-icon w_46 round snmnn1">
                            <span className="icon icon-arrow-right" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ul className="menu-list">
                    {item.children.map((subItem, subIndex) => (
                      <li key={subIndex} className={subItem.children?.length > 0 ? "menu-item-2" : ""}>
                        <Link
                          href={subItem.url || "#"}
                          target={subItem.target || "_self"}
                          className={`menu-link-text link ${isMenuActive(subItem) ? "activeMenu" : ""} ${
                            subItem.css_class || ""
                          }`}
                        >
                          {subItem.title}
                        </Link>
                        {subItem.children?.length > 0 && (
                          <div className="sub-menu submenu-default">
                            <ul className="menu-list">
                              {subItem.children.map((subItem2, subIndex2) => (
                                <li key={subIndex2}>
                                  <Link
                                    href={subItem2.url || "#"}
                                    target={subItem2.target || "_self"}
                                    className={`menu-link-text link ${isMenuActive(subItem2) ? "activeMenu" : ""} ${
                                      subItem2.css_class || ""
                                    }`}
                                  >
                                    {subItem2.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        );
      })}
    </>
  );
}
