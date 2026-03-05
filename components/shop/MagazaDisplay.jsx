"use client";
import React, { useState, useEffect } from "react";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";
import Sorting from "./Sorting";
import ShopFilter from "./ShopFilter";

/**
 * MagazaDisplay - Client Component
 * Bu bileşen artık filtreleme ve sıralama özelliklerini de içeriyor.
 */
export default function MagazaDisplay({ products: initialProducts = [], categories = [] }) {
    const [products, setProducts] = useState(initialProducts);
    const [finalSorted, setFinalSorted] = useState([]);

    // Sayfa ilk yüklendiğinde ürünleri set et
    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    // GTM - view_item_list takibi
    useEffect(() => {
        const listToTrack = finalSorted.length > 0 ? finalSorted : products;
        if (listToTrack && listToTrack.length > 0) {
            import('@/utils/analytics').then(({ trackViewItemList }) => {
                trackViewItemList(listToTrack, 'Mağaza Ürün Listesi', 'shop_page');
            });
        }
    }, [products, finalSorted]);

    return (
        <>
            <section className="magaza-list-section">
                <div className="container">
                    {/* Filtre ve Sıralama Çubuğu */}
                    <div className="magaza-controls">
                        <div className="control-left">
                            <a href="#filterShop" data-bs-toggle="offcanvas" aria-controls="offcanvasLeft" className="tf-btn-filter">
                                <span className="icon icon-filter" />
                                <span className="text">Kategoriler</span>
                            </a>
                        </div>

                        <div className="control-right">
                            <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                                <Sorting setFinalSorted={setFinalSorted} products={products} />
                            </div>
                        </div>
                    </div>

                    {/* Ürün Izgarası (Grid) */}
                    <div className="product-grid">
                        {(finalSorted.length > 0 ? finalSorted : products).map((product, index) => (
                            <div key={product.id || index} className="product-col">
                                <ProductCardSimart product={product} />
                            </div>
                        ))}
                    </div>
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

                    /* Responsive Ayarlar */
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

            {/* Yan Filtre Menüsü (Offcanvas) */}
            <ShopFilter setProducts={setProducts} products={initialProducts} categories={categories} />
        </>
    );
}
