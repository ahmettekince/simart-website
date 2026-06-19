"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";
import Sorting from "./Sorting";
import ShopFilter from "./ShopFilter";
import { useLangStore } from "@/stores/langStore";

const FILTER_LABELS = {
    tr: "Kategoriler",
    en: "Categories",
};

const BATCH_SIZE = 24;

function sortByStockAvailability(list) {
    return [...list].sort((a, b) => {
        const availA = a.is_in_stock || a.is_pre_order;
        const availB = b.is_in_stock || b.is_pre_order;
        if (availA === availB) return 0;
        return availA ? -1 : 1;
    });
}

function buildAlternatePaths(category) {
    if (!category?.slugs) return {};

    const paths = {};
    for (const currLang of ["tr", "en"]) {
        const slug = category.slugs[currLang] || category.slug;
        if (!slug) continue;
        const prefix = currLang === "en" ? "/en/shop" : "/magaza";
        paths[currLang] = `${prefix}/${slug}`;
    }
    return paths;
}

export default function MagazaDisplay({ products: initialProducts = [], categories = [], initialCategory = null }) {
    const lang = useLangStore((s) => s.lang);
    const setAlternatePaths = useLangStore((s) => s.setAlternatePaths);

    const baseProducts = useMemo(
        () => sortByStockAvailability(initialProducts),
        [initialProducts]
    );

    const [sortedProducts, setSortedProducts] = useState([]);
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const lastTrackedIds = useRef("");
    const loadMoreRef = useRef(null);
    const isLoadingMore = useRef(false);

    const displayProducts = useMemo(
        () => (sortedProducts.length > 0 ? sortedProducts : baseProducts),
        [sortedProducts, baseProducts]
    );

    const visibleProducts = useMemo(
        () => displayProducts.slice(0, visibleCount),
        [displayProducts, visibleCount]
    );

    const hasMore = visibleCount < displayProducts.length;

    useEffect(() => {
        setAlternatePaths(initialCategory ? buildAlternatePaths(initialCategory) : {});
        return () => setAlternatePaths({});
    }, [initialCategory, setAlternatePaths]);

    useEffect(() => {
        setSortedProducts([]);
        setVisibleCount(BATCH_SIZE);
    }, [initialProducts]);

    useEffect(() => {
        setVisibleCount((prev) => Math.min(prev, displayProducts.length || BATCH_SIZE));
    }, [displayProducts.length]);

    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting || isLoadingMore.current) return;

                isLoadingMore.current = true;
                setVisibleCount((prev) => {
                    const next = Math.min(prev + BATCH_SIZE, displayProducts.length);
                    isLoadingMore.current = false;
                    return next;
                });
            },
            { rootMargin: "400px 0px" }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, displayProducts.length]);

    useEffect(() => {
        if (displayProducts.length === 0) return;

        const currentIds = displayProducts.map((p) => p.id || p.productId).join(",");
        if (lastTrackedIds.current === currentIds) return;

        lastTrackedIds.current = currentIds;

        import("@/utils/analytics").then(({ trackViewItemList }) => {
            trackViewItemList(displayProducts, "Mağaza Ürün Listesi", "shop_page");
        });
    }, [displayProducts]);

    return (
        <>
            <section className="magaza-list-section">
                <div className="container">
                    <div className="magaza-controls">
                        <div className="control-left">
                            <a href="#filterShop" data-bs-toggle="offcanvas" aria-controls="offcanvasLeft" className="tf-btn-filter">
                                <span className="icon icon-filter" />
                                <span className="text">{FILTER_LABELS[lang] || FILTER_LABELS.tr}</span>
                            </a>
                        </div>

                        <div className="control-right">
                            <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                                <Sorting setFinalSorted={setSortedProducts} products={baseProducts} />
                            </div>
                        </div>
                    </div>

                    <div className="product-grid">
                        {visibleProducts.map((product, index) => (
                            <div key={product.id || index} className="product-col">
                                <ProductCardSimart
                                    product={product}
                                    lazyGallery
                                    isPriority={index < 8}
                                />
                            </div>
                        ))}
                    </div>

                    {hasMore && <div ref={loadMoreRef} className="magaza-load-sentinel" aria-hidden="true" />}
                </div>

                <style jsx>{`
                    .magaza-list-section {
                        padding: 20px 0 80px;
                    }

                    .magaza-controls {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #efefef;
                    }

                    .tf-btn-filter {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 8px;
                        font-weight: 600;
                        font-size: 12px;
                        color: #000;
                        text-decoration: none;
                    }
                    .tf-btn-filter .icon {
                        order: -1;
                    }

                    .product-grid {
                        display: flex;
                        flex-wrap: wrap;
                        margin: -15px;
                    }
                    .product-col {
                        padding: 15px;
                        flex: 0 0 25%;
                        max-width: 25%;
                    }

                    .magaza-load-sentinel {
                        width: 100%;
                        height: 1px;
                    }

                    @media (max-width: 1200px) {
                        .product-col {
                            flex: 0 0 33.333%;
                            max-width: 33.333%;
                        }
                    }
                    @media (max-width: 768px) {
                        .product-grid {
                            margin: -6px;
                        }
                        .product-col {
                            flex: 0 0 50%;
                            max-width: 50%;
                            padding: 6px;
                        }
                        .magaza-list-section {
                            padding: 10px 0 60px;
                        }
                        .magaza-controls {
                            margin-bottom: 20px;
                        }
                    }
                    @media (max-width: 480px) {
                        .product-grid {
                            margin: -4px;
                        }
                        .product-col {
                            padding: 4px;
                        }
                    }
                `}</style>
            </section>

            <ShopFilter categories={categories} />
        </>
    );
}
