"use client";
import React from "react";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { useCartStore } from "@/stores/cartStore";
import ProductImageSwiper from "@/components/common/ProductImageSwiper";
import { getProductButtonState } from "@/utils/productStock";

export default function ProductCardSimart({ product }) {
  const context = useContextElement();
  const addToWishlist = context?.addToWishlist || (() => { });
  const isAddedtoWishlist = context?.isAddedtoWishlist || (() => false);
  const { addItem, isInCart } = useCartStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const [isWishlistProcessing, setIsWishlistProcessing] = React.useState(false);

  // -- Veriler --
  const title = product.name || product.title;
  const finalPrice = product.discount_price || product.price || 0;
  const oldPrice = product.discount_price ? product.price : null;
  const rating = product.rating || product.average_rating || 0;
  const reviewCount = product.reviews_count || product.review_count || 0;
  const productSlug = product.slug || product.id;
  const isAdded = isAddedtoWishlist(product.id);

  // Kategori slug'ını al (ilk kategoriden)
  const getCategorySlug = () => {
    if (product.categories && product.categories.length > 0) {
      const category = product.categories[0];
      // Slug varsa onu kullan
      if (category.slug) {
        return category.slug;
      }
      // Slug yoksa kategori adını slug'a çevir
      if (category.name) {
        return category.name
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
    }
    // Kategori yoksa varsayılan olarak "urunler" kullan
    return "urunler";
  };
  const categorySlug = getCategorySlug();

  // -- Buton Metin Mantığı --
  const { buttonText, buttonDisabled } = getProductButtonState(product);

  return (
    <div className="product-card-simart">
      {/* Üst Kısım: Görsel (Ölçek ve Kalite Korundu) */}
      <div className="card-image-area">
        <ProductImageSwiper
          images={product.images || []}
          productSlug={productSlug}
          productName={title}
          width={1000}
          height={1000}
          campaignTags={product.campaign_tags || []}
          categorySlug={categorySlug}
        />
      </div>

      {/* Alt Kısım: Bilgiler */}
      <div className="card-content-area">
        <div className="title-slot">
          <Link href={`/magaza/${categorySlug}/${productSlug}`} className="product-title">
            {title}
          </Link>
        </div>

        <div className="rating-slot">
          {rating > 0 && (
            <div className="rating-wrap">
              <div className="stars-box">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  const fillPercentage = Math.max(0, Math.min(100, ((rating - i) * 100)));
                  const isFilled = rating >= starValue;
                  const isPartial = rating > i && rating < starValue;

                  return (
                    <div key={i} className="star-wrapper">
                      <i className="icon-star star-empty" />
                      {isFilled ? (
                        <i className="icon-star star-filled" />
                      ) : isPartial ? (
                        <i
                          className="icon-star star-filled star-partial"
                          style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <span className="rating-num">{rating.toFixed(1)}</span>
              {reviewCount > 0 && <span className="review-num">({reviewCount})</span>}
            </div>
          )}
        </div>

        <div className="price-slot">
          <span className={`price-new fw-bold ${oldPrice ? "price-discount" : "price-normal"}`}>
            ₺{finalPrice.toLocaleString("tr-TR")}
          </span>
          {oldPrice && <span className="price-old">₺{oldPrice.toLocaleString("tr-TR")}</span>}
        </div>

        <div className="button-row">
          <div className="flex-grow-1">
            <button
              onClick={async () => {
                if (isAdding || showSuccess) return;
                setIsAdding(true);
                try {
                  await addItem(product, 1, false);
                  // Başarılı olduğunda animasyon göster
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 2000); // Animasyon 2 saniye sürüyor
                } catch (error) {
                  console.error("Sepete ekleme hatası:", error);
                } finally {
                  setIsAdding(false);
                }
              }}
              disabled={buttonDisabled || isAdding || showSuccess}
              className={`main-cart-btn ${showSuccess ? "success-animation" : ""} ${buttonText === "Stokta Yok" ? "out-of-stock" : ""}`}
              style={{ opacity: 1 }}
            >
              <span className="button-text-main">
                {showSuccess ? "Sepete Eklendi" : isAdding ? "Ekleniyor..." : buttonText}
              </span>
              {showSuccess && <span className="button-text-slide">Sepete Eklendi</span>}
            </button>
          </div>
          {/* <button
            onClick={() => {
              if (isWishlistProcessing) return;

              setIsWishlistProcessing(true);
              addToWishlist(product.id);

              // Tooltip'i kapat
              if (typeof window !== "undefined") {
                const tooltips = document.querySelectorAll(".action-tooltip");
                tooltips.forEach((tooltip) => {
                  tooltip.style.opacity = "0";
                  tooltip.style.visibility = "hidden";
                });
              }

              // Cooldown: 500ms sonra tekrar tıklanabilir
              setTimeout(() => {
                setIsWishlistProcessing(false);
              }, 500);
            }}
            onMouseLeave={() => {
              // Mouse ayrıldığında tooltip'i kapat
              if (typeof window !== "undefined") {
                const tooltips = document.querySelectorAll(".action-tooltip");
                tooltips.forEach((tooltip) => {
                  tooltip.style.opacity = "0";
                  tooltip.style.visibility = "hidden";
                });
              }
            }}
            disabled={isWishlistProcessing}
            className={`wish-action-btn ${isAdded ? "active" : ""}`}
            style={{
              cursor: isWishlistProcessing ? "wait" : "pointer",
              opacity: isWishlistProcessing ? 0.7 : 1
            }}
          >
            <i className={`icon ${isAdded ? "icon-delete" : "icon-heart"}`} />
            <span className="action-tooltip">{isAdded ? "Favorilerden Kaldır" : "Favorilere Ekle"}</span>
          </button> */}
        </div>
      </div>

      <style jsx>{`
                .product-card-simart {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
          min-height: 400px;
                    width: 100%;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    position: relative;
                }
                
                /* Görsel Alanı: Kesme Sadece Burada (Tooltip'i engellemesin diye) */
                .card-image-area {
                    overflow: hidden;
                    border-radius: 12px 12px 0 0;
          flex-shrink: 0;
                    transform: translateZ(0);
                }

                .card-content-area {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    padding: 12px;
          min-height: 0;
          justify-content: flex-end;
                }

                /* Hizalama Slotları */
        .title-slot {
          height: 40px;
          margin-bottom: 4px;
          overflow: hidden;
          flex-shrink: 0;
          font-weight: bold;         
        }
        .rating-slot {
          height: 20px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .price-slot {
          height: 24px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .button-row {
          display: flex;
          gap: 8px;
          align-items: center;
          width: 100%;
          flex-shrink: 0;
        }
        .button-row .flex-grow-1 {
          flex: 1;
          min-width: 0;
          display: flex;
          width: 100%;
        }

                /* Metin Stilleri */
                .product-title {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-size: 12px;
                    line-height: 20px;
                    font-weight: bold;
                    color: #000;
                }
        .rating-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stars-box {
          display: flex;
          gap: 2px;
        }
        .star-wrapper {
          position: relative;
          display: inline-block;
          font-size: 12px;
          line-height: 1;
        }
        .star-wrapper .star-empty {
          color: #ddd;
        }
        .star-wrapper .star-filled {
          position: absolute;
          top: 0;
          left: 0;
          color: #f59e0b;
        }
        .star-wrapper .star-partial {
          clip-path: inset(0 0 0 0);
        }
        .rating-num {
          font-size: 13px;
          font-weight: 600;
        }
        .review-num {
          font-size: 12px;
          color: #888;
        }
        .price-old {
          font-size: 13px;
          text-decoration: line-through;
          color: #999;
          margin-left: 8px;
        }
        .price-new {
          font-size: 16px;
        }
        .price-new.price-normal {
          color: #3c81b5;
        }
        .price-new.price-discount {
          color: #0bc15c;
        }

                /* Butonlar (Tema renkleri kullanılıyor) */
        .main-cart-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          align-items: center;
          padding: 0 16px;
          display: flex;
          text-align: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          border: 1px solid var(--primary);
          background: var(--primary);
          color: #fff;
          cursor: pointer;
        }

        .main-cart-btn:disabled {
          opacity: 1 !important;
          cursor: not-allowed;
        }

        .main-cart-btn.out-of-stock {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
        }

        .main-cart-btn.out-of-stock:disabled {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
          opacity: 1 !important;
        }

        .main-cart-btn .button-text-main,
        .main-cart-btn .button-text-slide {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          width: 100%;
          flex: 1;
          min-width: 0;
          text-align: center;
          position: relative;
        }

        /* Başarı animasyonu - Buton içinden yukarı doğru çıkan yazı */
        .main-cart-btn.success-animation {
          background: #10b981;
          border-color: #10b981;
          overflow: hidden;
        }

        .main-cart-btn.success-animation .button-text-main {
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.2s, transform 0.2s;
        }

        .main-cart-btn.success-animation .button-text-slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          color: #fff;
          z-index: 1;
          animation: slideUpFromButton 2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUpFromButton {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          20% {
            transform: translateY(0);
            opacity: 1;
          }
          80% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
                }
                
                .wish-action-btn {
                    position: relative;
                    width: 44px;
                    height: 44px;
          min-width: 44px;
          min-height: 44px;
          max-width: 44px;
          max-height: 44px;
                    border-radius: 50%;
                    border: 1px solid #ddd;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
          flex-shrink: 0;
          padding: 0;
                }
        .wish-action-btn:hover:not(:active) {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .wish-action-btn.active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .wish-action-btn:active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .wish-action-btn i {
          font-size: 18px;
          line-height: 1;
        }
                
        /* Tooltip (Kesilmeyen Yapı) - Sadece desktop'ta hover ile göster */
                .action-tooltip {
                    position: absolute;
                    bottom: 115%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #333;
                    color: #fff;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: 0.2s;
                    z-index: 999;
          pointer-events: none;
        }
        /* Sadece hover ile göster (mobilde gösterme) */
        @media (hover: hover) and (pointer: fine) {
          .wish-action-btn:hover .action-tooltip {
            opacity: 1;
            visibility: visible;
          }
        }

                @media (max-width: 768px) {
          .card-content-area {
            padding: 10px;
          }
          .price-slot {
            margin-bottom: 8px;
          }
          .button-row {
            gap: 6px;
          }
          .wish-action-btn {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
            max-width: 40px;
            max-height: 40px;
          }
          .wish-action-btn i {
            font-size: 16px;
          }
        }
        @media (max-width: 480px) {
          .button-row {
            gap: 4px;
          }
          .wish-action-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
            min-height: 36px;
            max-width: 36px;
            max-height: 36px;
          }
          .wish-action-btn i {
            font-size: 14px;
          }
                }
            `}</style>
    </div>
  );
}
