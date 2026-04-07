"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLocalizedUrl } from "@/utils/i18n";
import { useLangStore } from "@/stores/langStore";

export default function ShopFilter({ categories = [] }) {
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);

  // Route değiştiğinde offcanvas'ı tamamen temizle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const offcanvasElements = document.querySelectorAll(".offcanvas.show");
      offcanvasElements.forEach((element) => {
        element.classList.remove("show");
      });
      const backdrops = document.querySelectorAll(".offcanvas-backdrop, .modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());
      document.body.classList.remove("offcanvas-open", "modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }
  }, [pathname]);

  const filteredCategories = categories?.filter(
    (c) => c && c.slug && c.name && c.is_active !== false
  ) || [];

  const translations = {
    tr: {
      categories: "Kategoriler",
      allProducts: "Tüm Ürünler",
      noCategory: "Kategori bulunamadı"
    },
    en: {
      categories: "Categories",
      allProducts: "All Products",
      noCategory: "No categories found"
    }
  };

  const t = translations[lang] || translations.tr;

  return (
    <div className="offcanvas offcanvas-start canvas-filter" id="filterShop">
      <div className="canvas-wrapper">
        <header className="canvas-header">
          <span className="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close" />
        </header>
        <div className="canvas-body" style={{ paddingBottom: "0px !important" }}>
          <div className="widget-facet wd-categories">
            <div
              className="facet-title"
              data-bs-target="#categories"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="categories"
            >
              <span className="d-flex align-items-center gap-2">
                <span className="icon icon-filter" style={{ flexShrink: 0 }} />
                <b>{t.categories}</b>
              </span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="categories" className="collapse show">
              <ul className="list-categoris current-scrollbar mb_36 shop-filter-categories">
                {/* Tüm Ürünler */}
                <li className="cate-item cate-item-all">
                  <Link href={getLocalizedUrl("/magaza", lang)} className="cate-link-with-img">
                    <span className="cate-img-wrap cate-img-placeholder">
                      <span className="icon icon-grid" />
                    </span>
                    <span className="cate-name">{t.allProducts}</span>
                  </Link>
                </li>
                {filteredCategories.map((category) => {
                  const categoryUrl = getLocalizedUrl(`/magaza/${category.slug}`, lang);
                  const thumbUrl = category.image?.thumbnail_url || category.image?.url;
                  return (
                    <li key={category.slug} className="cate-item">
                      <Link href={categoryUrl} className="cate-link-with-img">
                        {thumbUrl ? (
                          <span className="cate-img-wrap">
                            <Image
                              src={thumbUrl}
                              alt={category.image?.alt_text || category.name}
                              width={64}
                              height={64}
                              className="cate-thumb"
                            />
                          </span>
                        ) : (
                          <span className="cate-img-wrap cate-img-placeholder">
                            <span className="icon icon-grid" />
                          </span>
                        )}
                        <span className="cate-name">{category.name}</span>
                      </Link>
                    </li>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <li className="cate-item">
                    <span>{t.noCategory}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
