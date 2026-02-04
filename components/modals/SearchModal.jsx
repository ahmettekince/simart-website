"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import apiClient from "@/utils/apiClient";

export default function SearchModal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimerRef = useRef(null);

  // Başlangıçta önerileri çek
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await apiClient.get("/products/search");
        if (response.data?.status === "success" && response.data?.data?.items) {
          setRecommendations(response.data.data.items);
        }
      } catch (error) {
        console.error("Öneriler yüklenirken hata:", error);
      }
    };

    fetchRecommendations();
  }, []);

  // Arama yapma fonksiyonu
  const performSearch = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get("/products/search", {
        params: { q: query },
      });

      if (response.data?.status === "success" && response.data?.data?.items) {
        setSearchResults(response.data.data.items);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  // Debounce ile arama
  useEffect(() => {
    // Önceki timer'ı temizle
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Yeni timer oluştur
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 400); // 400ms debounce

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Input değişikliği
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  // Ürün linki oluşturma (kategori bilgisi yoksa varsayılan olarak "urunler" kullan)
  const getProductLink = (product) => {
    // Slug'dan kategori çıkarmaya çalış veya varsayılan kullan
    const categorySlug = "urunler"; // Varsayılan kategori
    return `/magaza/${categorySlug}/${product.slug}`;
  };

  // Fiyat formatı
  const formatPrice = (price) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Görsel URL'i al
  const getImageUrl = (product) => {
    if (product.cover_image?.url) {
      return product.cover_image.url;
    }
    if (product.cover_image?.thumbnail_url) {
      return product.cover_image.thumbnail_url;
    }
    return "/images/product/default.jpg";
  };

  const displayItems = showResults && searchTerm.length >= 3 ? searchResults : recommendations;
  const hasItems = displayItems && displayItems.length > 0;

  return (
    <div className="offcanvas offcanvas-end canvas-search" id="canvasSearch">
      <div className="canvas-wrapper">
        <header className="tf-search-head">
          <div className="title fw-5">
            Site içinde ara
            <div className="close">
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
          </div>
          <div className="tf-search-sticky">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="tf-mini-search-frm"
            >
              <fieldset className="text">
                <input
                  type="text"
                  placeholder="Ara..."
                  className=""
                  name="text"
                  tabIndex={0}
                  value={searchTerm}
                  onChange={handleInputChange}
                  aria-required="true"
                  required
                />
              </fieldset>
              <button className="" type="submit">
                <i className="icon-search" />
              </button>
            </form>
          </div>
        </header>
        <div className="canvas-body p-0">
          <div className="tf-search-content">
            {loading && (
              <div className="text-center p-4">
                <span>Aranıyor...</span>
              </div>
            )}
            {!loading && (
              <div className={hasItems ? "tf-cart-has-results" : "tf-cart-hide-has-results"}>
                {hasItems ? (
                  <div className="tf-col-content">
                    <div className="tf-search-content-title fw-5">
                      {showResults && searchTerm.length >= 3
                        ? "Arama Sonuçları"
                        : "Öneriler"}
                    </div>
                    <div className="tf-search-hidden-inner">
                      {displayItems.map((product) => (
                        <div className="tf-loop-item" key={product.id}>
                          <div className="image">
                            <Link href={getProductLink(product)}>
                              <Image
                                alt={product.name}
                                src={getImageUrl(product)}
                                width={80}
                                height={80}
                                style={{ objectFit: "cover" }}
                              />
                            </Link>
                          </div>
                          <div className="content">
                            <Link href={getProductLink(product)} className="d-block">
                              {product.name}
                            </Link>
                            {(product.reviews?.average_rating != null && product.reviews.average_rating > 0) || (product.reviews?.count != null && product.reviews.count > 0) ? (
                              <div className="rating-wrap" style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <div className="stars-box" style={{ display: "flex", gap: "2px" }}>
                                  {[...Array(5)].map((_, i) => {
                                    const starValue = i + 1;
                                    const rating = product.reviews?.average_rating ?? 0;
                                    const fillPercentage = Math.max(0, Math.min(100, ((rating - i) * 100)));
                                    const isFilled = rating >= starValue;
                                    const isPartial = rating > i && rating < starValue;

                                    return (
                                      <div key={i} className="star-wrapper" style={{ position: "relative", display: "inline-block", fontSize: "12px", lineHeight: 1 }}>
                                        <i className="icon-star star-empty" style={{ color: "#ddd" }} />
                                        {isFilled ? (
                                          <i className="icon-star star-filled" style={{ position: "absolute", top: 0, left: 0, color: "#f59e0b" }} />
                                        ) : isPartial ? (
                                          <i
                                            className="icon-star star-filled star-partial"
                                            style={{
                                              position: "absolute",
                                              top: 0,
                                              left: 0,
                                              color: "#f59e0b",
                                              clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
                                            }}
                                          />
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                                <span className="rating-num" style={{ fontSize: "13px", fontWeight: 600 }}>
                                  {(product.reviews?.average_rating ?? 0).toFixed(1)}
                                </span>
                                {(product.reviews?.count ?? 0) > 0 && (
                                  <span className="review-num" style={{ fontSize: "12px", color: "#888" }}>
                                    ({product.reviews.count})
                                  </span>
                                )}
                              </div>
                            ) : null}
                            <div className="tf-product-info-price" style={{ marginTop: "4px" }}>
                              {product.discount_price && product.discount_price < product.price ? (
                                <>
                                  <div className="compare-at-price">
                                    {formatPrice(product.price)}
                                  </div>
                                  <div className="price-on-sale fw-6">
                                    {formatPrice(product.final_price || product.discount_price)}
                                  </div>
                                </>
                              ) : (
                                <div className="price fw-6">
                                  {formatPrice(product.final_price || product.price)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {showResults && searchTerm.length >= 3 ? (
                      <div className="text-center p-4">
                        <p>Sonuç bulunamadı.</p>
                      </div>
                    ) : (
                      <>
                        <div className="tf-col-quicklink">
                          <div className="tf-search-content-title fw-5">Hızlı Bağlantılar</div>
                          <ul className="tf-quicklink-list">
                            <li className="tf-quicklink-item">
                              <Link href={`/magaza`} className="">
                                Tüm Ürünler
                              </Link>
                            </li>
                            <li className="tf-quicklink-item">
                              <Link href={`/magaza`} className="">
                                Kategoriler
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="tf-col-content">
                          <div className="tf-search-content-title fw-5">
                            İlham mı lazım?
                          </div>
                          <div className="text-center p-4">
                            <p>Arama yapmak için en az 3 karakter girin.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
