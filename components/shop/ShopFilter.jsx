"use client";
import { products1 } from "@/data/products";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ShopFilter({ setProducts, products = products1, categories = [] }) {
  const pathname = usePathname();

  // Route değiştiğinde offcanvas'ı tamamen temizle
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Tüm offcanvas elementlerini kapat
      const offcanvasElements = document.querySelectorAll(".offcanvas.show");
      offcanvasElements.forEach((element) => {
        element.classList.remove("show");
      });

      // Tüm backdrop'ları temizle
      const backdrops = document.querySelectorAll(".offcanvas-backdrop, .modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());

      // Body'yi tamamen temizle
      document.body.classList.remove("offcanvas-open", "modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }
  }, [pathname]);

  return (
    <div className="offcanvas offcanvas-start canvas-filter" id="filterShop">
      <div className="canvas-wrapper">
        <header className="canvas-header">
          <span className="icon-close icon-close-popup" data-bs-dismiss="offcanvas" aria-label="Close" />
        </header>
        <div className="canvas-body">
          <div className="widget-facet wd-categories">
            <div
              className="facet-title"
              data-bs-target="#categories"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="categories"
            >
              <span>
                <b>Kategoriler</b>
              </span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="categories" className="collapse show">
              <ul className="list-categoris current-scrollbar mb_36">
                {categories && categories.length > 0 ? (
                  categories
                    .filter((category) => category && category.slug && category.name && (category.is_active !== false))
                    .map((category) => {
                      const categorySlug = category.slug;
                      const categoryUrl = `/magaza/${categorySlug}`;
                      return (
                        <li key={category.slug} className="cate-item">
                          <Link href={categoryUrl}>
                            <span>{category.name}</span>
                          </Link>
                        </li>
                      );
                    })
                ) : (
                  <li className="cate-item">
                    <span>Kategori bulunamadı</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-5"></div>
        </div>
      </div>
    </div>
  );
}
