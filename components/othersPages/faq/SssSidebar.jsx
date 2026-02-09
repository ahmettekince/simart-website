"use client";

import { useMemo, useState } from "react";

export default function SssSidebar({
  categories = [],
  productsByCategory = {},
  selectedProduct,
  onSelectProduct,
}) {
  const filteredCategories = useMemo(
    () =>
      categories?.filter((c) => c && c.slug && c.name && c.is_active !== false) || [],
    [categories]
  );

  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");

  const allProducts = useMemo(() => {
    const list = [];
    filteredCategories.forEach((cat) => {
      const slug = cat.slug;
      const products = slug ? productsByCategory[slug] || [] : [];
      products.forEach((p) => {
        list.push({
          product: p,
          categorySlug: slug,
          categoryName: cat.name ?? cat.title ?? cat.slug ?? "Kategori",
        });
      });
    });
    return list;
  }, [filteredCategories, productsByCategory]);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return allProducts.filter(({ product }) => {
      const name = (product.name || product.title || product.slug || "").toLowerCase();
      return name.includes(term);
    });
  }, [allProducts, searchTerm]);

  const handleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  const isProductSelected = (product) => {
    if (!selectedProduct) return false;
    return (selectedProduct?.id ?? selectedProduct?.slug) === (product?.id ?? product?.slug);
  };

  const scrollToMediaSection = () => {
    const element = document.getElementById("product-media-section");
    if (element) {
      const offset = 100; // Sticky header payı
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleSelectFromSearch = (item) => {
    const catIndex = filteredCategories.findIndex(
      (c) => c.slug === item.categorySlug
    );
    if (catIndex !== -1) {
      setExpandedIndex(catIndex);
    }
    onSelectProduct?.(item.product);
    setSearchTerm("");
    // Mobilde ürün seçince aşağı kaydır
    if (window.innerWidth < 768) {
      scrollToMediaSection();
    }
  };

  const handleSelectProduct = (product) => {
    onSelectProduct?.(product);
    // Mobilde ürün seçince aşağı kaydır
    if (window.innerWidth < 768) {
      scrollToMediaSection();
    }
  };

  return (
    <div className="tf-accordion-link-list w-100 sticky-top radius-10 border-line">
      {/* Ürün arama */}
      <div className="sss-product-search mb_15">
        <input
          type="text"
          className="form-control"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchResults.length > 0 && (
          <ul className="sss-product-search-results list-unstyled">
            {searchResults.slice(0, 8).map((item) => {
              const name =
                item.product.name ||
                item.product.title ||
                item.product.slug ||
                "Ürün";
              return (
                <li key={`${item.categorySlug}-${item.product.id || name}`}>
                  <button
                    type="button"
                    className="sss-product-search-item w-100 text-start border-0 bg-transparent py-1 px-0"
                    onClick={() => handleSelectFromSearch(item)}
                  >
                    <span className="name">{name}</span>
                    <span className="category">{item.categoryName}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flat-accordion style-default has-btns-arrow">
        {filteredCategories.length === 0 ? (
          <div className="p-3 text-muted">Kategori bulunamadı.</div>
        ) : (
          filteredCategories.map((cat, idx) => {
            const name = cat.name ?? cat.title ?? cat.slug ?? "Kategori";
            const slug = cat.slug;
            const products = slug ? productsByCategory[slug] || [] : [];
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={cat.id ?? cat.slug ?? idx}
                className={`flat-toggle ${isExpanded ? "active" : ""}`}
              >
                <div
                  className={`toggle-title ${isExpanded ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleExpand(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleExpand(idx);
                    }
                  }}
                >
                  {name}
                </div>

                {isExpanded && (
                  <div className="toggle-content" style={{ display: "block" }}>
                    {products.length === 0 ? (
                      <div className="text-muted small">Ürün bulunamadı</div>
                    ) : (
                      <ul className="sss-product-list list-unstyled mb-0">
                        {products.map((product) => {
                          const productName =
                            product.name ?? product.title ?? product.slug ?? "Ürün";
                          const active = isProductSelected(product);
                          return (
                            <li key={product.id ?? product.slug ?? product.name}>
                              <button
                                type="button"
                                className={`sss-product-item w-100 text-start border-0 bg-transparent py-2 px-0 ${active ? "active" : ""
                                  }`}
                                onClick={() => handleSelectProduct(product)}
                              >
                                {productName}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
