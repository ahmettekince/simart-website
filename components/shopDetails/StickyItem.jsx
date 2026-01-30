"use client";
import { options } from "@/data/singleProductOptions";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import Quantity from "./Quantity";
import { products4 } from "@/data/products";
import { useContextElement } from "@/context/Context";
import { useCartStore } from "@/stores/cartStore";
import { getProductButtonState } from "@/utils/productStock";

export default function StickyItem({
  product = null,
  quantity = 1,
  setQuantity = () => { },
  minQuantity = 1,
  maxQuantity = null,
  soldOut = false
}) {
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const stickyRef = useRef(null);
  const observerRef = useRef(null);

  // Scroll event ile sticky button'ı göster/gizle
  useEffect(() => {
    const handleScroll = () => {
      const buyButton = document.querySelector(".tf-product-info-buy-button");
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        // Buy button viewport'tan çıktığında sticky button'ı göster
        setIsVisible(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // İlk yüklemede kontrol et

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // IntersectionObserver ile de kontrol edebiliriz
  useEffect(() => {
    const buyButton = document.querySelector(".tf-product-info-buy-button");
    if (!buyButton) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Buy button görünür değilse sticky button'ı göster
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
  }, []);

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
    }
    return displayProduct.imgSrc;
  };
  const productImage = getImageUrl();
  const buttonState = product ? getProductButtonState(product) : { buttonText: "Sepete Ekle", buttonDisabled: false };

  const handleAddToCart = async () => {
    if (isAdding || showSuccess || buttonState.buttonDisabled) return;
    setIsAdding(true);
    try {
      if (product) {
        await addItem(product, quantity, false);
      } else {
        addProductToCart(displayProduct.id);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`tf-sticky-btn-atc ${isVisible ? "show" : ""}`} ref={stickyRef}>
      <div className="container">
        <div className="tf-height-observer w-100 d-flex align-items-center">
          <div className="tf-sticky-atc-product d-flex align-items-center">
            <div className="tf-sticky-atc-img">
              <Image
                className="lazyloaded"
                data-src={productImage}
                alt={productName}
                src={productImage}
                width={770}
                height={1075}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="tf-sticky-atc-title fw-5 d-xl-block d-none">
              {productName}
            </div>
          </div>
          <div className="tf-sticky-atc-infos">
            <form onSubmit={(e) => e.preventDefault()} className="">
              <div className="tf-sticky-atc-btns">
                <div className="tf-product-info-quantity">
                  <Quantity
                    setQuantity={setQuantity}
                    minQuantity={minQuantity}
                    maxQuantity={maxQuantity}
                    initialValue={quantity}
                    disabled={buttonState.buttonDisabled}
                  />
                </div>
                {soldOut || buttonState.buttonDisabled ? (
                  <button
                    type="button"
                    disabled
                    className={`main-cart-btn ${buttonState.buttonText === "Stokta Yok" ? "out-of-stock" : ""}`}
                  >
                    <span className="button-text-main">{buttonState.buttonText}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || showSuccess}
                    className={`main-cart-btn ${showSuccess ? "success-animation" : ""}`}
                  >
                    <span className="button-text-main">
                      {showSuccess ? "Sepete Eklendi" : isAdding ? "Ekleniyor..." : buttonState.buttonText}
                    </span>
                    {showSuccess && <span className="button-text-slide">Sepete Eklendi</span>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx>{`
        .tf-sticky-atc-btns {
          display: flex;
          gap: 12px;
          align-items: center;
          width: 100%;
        }
        .tf-sticky-atc-btns .tf-product-info-quantity {
          flex-shrink: 0;
        }
        .tf-sticky-atc-btns .main-cart-btn {
          flex: 1;
          min-width: 0;
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
        .tf-sticky-atc-btns .main-cart-btn:disabled {
          opacity: 1 !important;
          cursor: not-allowed;
        }
        .tf-sticky-atc-btns .main-cart-btn.out-of-stock {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
        }
        .tf-sticky-atc-btns .main-cart-btn.out-of-stock:disabled {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
          opacity: 1 !important;
        }
        .tf-sticky-atc-btns .main-cart-btn .button-text-main,
        .tf-sticky-atc-btns .main-cart-btn .button-text-slide {
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
        .tf-sticky-atc-btns .main-cart-btn.success-animation {
          background: #10b981;
          border-color: #10b981;
          overflow: hidden;
        }
        .tf-sticky-atc-btns .main-cart-btn.success-animation .button-text-main {
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.2s, transform 0.2s;
        }
        .tf-sticky-atc-btns .main-cart-btn.success-animation .button-text-slide {
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
      `}</style>
    </div>
  );
}
