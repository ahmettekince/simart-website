"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useCartStore } from "@/stores/cartStore";
import { getProductButtonState } from "@/utils/productStock";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";

export default function StickyItem({
  product = null,
  quantity = 1,
  maxQuantity = null,
  soldOut = false
}) {
  const { addItem } = useCartStore();
  const cartItems = useCartStore((s) => s.items);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const stickyRef = useRef(null);
  const observerRef = useRef(null);

  // Mobil kontrolü (767px)
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 767);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobilde sticky bar her zaman görünür; masaüstünde scroll ile göster/gizle
  useEffect(() => {
    const handleScroll = () => {
      if (isMobile) {
        setIsVisible(true);
        return;
      }
      const buyButton = document.querySelector(".tf-product-info-buy-button");
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        const hasScrolled = window.scrollY > 0;
        setIsVisible(hasScrolled && rect.bottom < 0);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      return;
    }
    const buyButton = document.querySelector(".tf-product-info-buy-button");
    if (!buyButton) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(!entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    observerRef.current.observe(buyButton);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile]);

  // Ürün bilgileri
  const displayProduct = product || products4[2];
  const productName = product?.name || product?.title || displayProduct.title;

  // Görsel URL'ini al
  const getImageUrl = () => {
    if (product) {
      if (product.cover_image?.url) return product.cover_image.url;
      if (product.cover_image?.thumbnail_url) return product.cover_image.thumbnail_url;
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === "string") return firstImage;
        if (firstImage?.url) return firstImage.url;
      }
      if (product.gallery_images && product.gallery_images.length > 0) {
        const first = product.gallery_images[0];
        if (typeof first === "string") return first;
        if (first?.url) return first.url;
        if (first?.thumbnail_url) return first.thumbnail_url;
      }
    }
    return displayProduct.imgSrc;
  };
  const productImage = getImageUrl();
  const buttonState = product ? getProductButtonState(product) : { buttonText: "Sepete Ekle", buttonDisabled: false };

  const finalPrice = useMemo(() => {
    if (!product) return displayProduct?.price || 0;
    const tbd = product.time_based_discounts?.find((d) => d.remaining_minutes != null);
    if (tbd?.discounted_price != null) return tbd.discounted_price;
    return product.discount_price ?? product.price ?? 0;
  }, [product, displayProduct]);
  const originalPrice = useMemo(() => {
    if (!product) return null;
    const tbd = product.time_based_discounts?.find((d) => d.remaining_minutes != null);
    if (tbd?.discounted_price != null) return product.price || product.discount_price || null;
    if (product.discount_price) return product.price || null;
    return null;
  }, [product]);
  const totalPrice = finalPrice * quantity;
  const totalOriginalPrice = originalPrice ? originalPrice * quantity : null;

  const existingCartItem = product && cartItems?.find((it) => it?.product?.id === product?.id || it?.id === product?.id);
  const effectiveMaxLimit = maxQuantity === null || maxQuantity === 0 ? 999 : Math.max(1, Number(maxQuantity));

  const handleAddToCart = async () => {
    if (isAdding || showSuccess || buttonState.buttonDisabled) return;
    if (product && effectiveMaxLimit < 999) {
      const currentQty = existingCartItem?.quantity || 0;
      if (currentQty >= effectiveMaxLimit) {
        setShowMaxReachedToast(true);
        return;
      }
    }
    setIsAdding(true);
    try {
      if (product) {
        const result = await addItem(product, quantity, false);
        if (result?.added) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } else {
        addProductToCart(displayProduct.id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`tf-sticky-btn-atc ${isVisible ? "show" : ""}`} ref={stickyRef}>
      <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantity} />
      <div className="container">
        <div className="tf-height-observer w-100 d-flex align-items-center">
          <div className="tf-sticky-atc-image d-none d-md-flex">
            {productImage && (
              <Image
                src={productImage}
                alt={productName || "Ürün"}
                width={70}
                height={70}
                className="rounded"
                style={{ objectFit: "cover" }}
                unoptimized={typeof productImage === "string" && productImage.startsWith("http")}
              />
            )}
          </div>
          <div className="tf-sticky-atc-mid">
            <p className="tf-sticky-atc-title-line d-none d-lg-block" title={productName || ""}>
              {productName || "Ürün"}
            </p>
            <div className={`tf-sticky-atc-price-wrap ${totalOriginalPrice != null && totalOriginalPrice > totalPrice ? "has-discount" : ""}`}>
              <span className="price-on-sale">{Number(totalPrice).toLocaleString("tr-TR")} TL</span>
              {totalOriginalPrice != null && totalOriginalPrice > totalPrice && (
                <span className="compare-at-price">{Number(totalOriginalPrice).toLocaleString("tr-TR")} TL</span>
              )}
            </div>
          </div>
          <div className="tf-sticky-atc-spacer" />
          <div className="tf-sticky-atc-infos">
            <form onSubmit={(e) => e.preventDefault()} className="">
              <div className="tf-sticky-atc-btns">
                {soldOut || buttonState.buttonDisabled ? (
                  <button
                    type="button"
                    disabled
                    className={`sticky-atc-btn ${buttonState.buttonText === "Stokta Yok" ? "sticky-atc-btn--out-of-stock" : ""}`}
                  >
                    <span className="sticky-atc-btn__text">{buttonState.buttonText}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || showSuccess}
                    className={`sticky-atc-btn ${showSuccess ? "sticky-atc-btn--success" : ""}`}
                  >
                    <span className="sticky-atc-btn__text">
                      {showSuccess ? "Sepete Eklendi" : isAdding ? "Ekleniyor..." : buttonState.buttonText}
                    </span>
                    {showSuccess && <span className="sticky-atc-btn__slide">Sepete Eklendi</span>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx>{`
        .tf-sticky-atc-image {
          flex-shrink: 0;
          margin-right: 12px;
        }
        .tf-sticky-atc-image img {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          object-fit: cover;
        }
        .tf-sticky-atc-price-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }
        .tf-sticky-atc-spacer {
          flex: 0 0 10px;
          width: 10px;
          min-width: 10px;
          max-width: 10px;
        }
        /* Mobil/tablet: fiyat ile buton arası 50px */
        @media (max-width: 991px) {
          .tf-sticky-atc-spacer {
            flex: 0 0 50px;
            width: 50px;
            min-width: 50px;
            max-width: 50px;
          }
        }
        .tf-sticky-atc-price-wrap .price-on-sale,
        .tf-sticky-atc-price-wrap .compare-at-price {
          white-space: nowrap;
        }
        .tf-sticky-atc-price-wrap .price-on-sale {
          font-size: 17px;
          font-weight: 700;
          color: var(--primary, #1c355e);
        }
        .tf-sticky-atc-price-wrap.has-discount .price-on-sale {
          color: #0bc15c;
        }
        .tf-sticky-atc-price-wrap .compare-at-price {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
        }
        .tf-sticky-atc-btns {
          display: flex;
          align-items: center;
          width: 100%;
        }

        /* Sticky bar kendi butonu - responsive */
        .sticky-atc-btn {
          width: 100%;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          -webkit-tap-highlight-color: transparent;
          background: var(--primary, #3c81b5);
          color: #fff;
          padding: 0 14px;
          height: 44px;
          font-size: 15px;
        }

        /* Mobilde buton "Sepete Eklendi" genişliğine göre sabit - animasyonda büyüyüp küçülmesin */
        @media (max-width: 767px) {
          .tf-sticky-atc-btns {
            width: auto;
            flex-shrink: 0;
            margin-left: auto;
          }
          .sticky-atc-btn {
            min-width: 150px;
            width: auto;
            max-width: 100%;
            padding: 0 20px;
          }
        }
        .sticky-atc-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .sticky-atc-btn:disabled {
          cursor: not-allowed;
          opacity: 1;
        }
        .sticky-atc-btn--out-of-stock {
          background: #dc2626;
          color: #fff;
        }
        .sticky-atc-btn--out-of-stock:disabled {
          background: #dc2626;
        }
        .sticky-atc-btn__text,
        .sticky-atc-btn__slide {
          display: block;
          width: 100%;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
        }
        .sticky-atc-btn--success {
          background: #10b981;
          overflow: hidden;
        }
        .sticky-atc-btn--success .sticky-atc-btn__text {
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.2s, transform 0.2s;
        }
        .sticky-atc-btn__slide {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          animation: stickyBtnSlide 2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes stickyBtnSlide {
          0% { transform: translateY(100%); opacity: 0; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        /* Tablet */
        @media (min-width: 768px) and (max-width: 991px) {
          .sticky-atc-btn {
            height: 40px;
            font-size: 15px;
            border-radius: 10px;
            padding: 0 16px;
          }
        }

        /* Desktop (sticky kart içinde) */
        @media (min-width: 992px) {
          .sticky-atc-btn {
            height: 36px;
            font-size: 15px;
            border-radius: 8px;
            padding: 0 12px;
          }
        }
      `}</style>
    </div>
  );
}
