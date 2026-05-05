"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useCartStore } from "@/stores/cartStore";
import { getProductButtonState } from "@/utils/productStock";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import ErrorToast from "@/components/common/ErrorToast";
import Quantity from "./Quantity";
import { useLangStore } from "@/stores/langStore";

export default function SmartStickyBar({
  product = null,
  quantity = 1,
  setQuantity = () => { },
  minQuantity = 1,
  maxQuantity = null,
  isStockLimit = false,
  soldOut = false
}) {
  const lang = useLangStore((s) => s.lang);
  const { addItem } = useCartStore();
  const cartItems = useCartStore((s) => s.items);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  const translations = {
    tr: {
      added: "Sepete Eklendi",
      adding: "Ekleniyor...",
      errorAdd: "Hata oluştu.",
      systemError: "Sistemsel bir hata.",
      outOfStock: "Stokta Yok",
      locale: "tr-TR"
    },
    en: {
      added: "Added to Cart",
      adding: "Adding...",
      errorAdd: "An error occurred.",
      systemError: "A system error.",
      outOfStock: "Out of Stock",
      locale: "en-US"
    }
  };

  const t = translations[lang] || translations.tr;

  // Initial check for mobile to show bar immediately
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    if (checkMobile()) {
      setIsVisible(true);
    }

    const buyButton = document.querySelector(".tf-product-info-buy-button");
    if (!buyButton) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          setIsVisible(true);
        } else {
          // Desktop: Appear when scrolled past the main button
          const isPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          setIsVisible(isPast);
        }
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

  // Global cart success listener
  useEffect(() => {
    const handleCartSuccess = (e) => {
      if (e.detail?.productId === product?.id) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    };
    window.addEventListener('cart-success', handleCartSuccess);
    return () => window.removeEventListener('cart-success', handleCartSuccess);
  }, [product?.id]);

  const productName = product?.name || product?.title || "";
  const productImage = product?.cover_image?.url || (product?.images && product?.images[0]?.url) || (product?.images && product?.images[0]) || "";
  const buttonState = product ? getProductButtonState(product, lang) : { buttonText: "Add to Cart", buttonDisabled: false };

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    const tbd = product.time_based_discounts?.find((d) => (d.remaining_minutes != null) || (d.remaining_seconds != null));
    if (tbd?.discounted_price != null) return tbd.discounted_price;
    return product.discount_price ?? product.price ?? 0;
  }, [product]);

  const originalPrice = useMemo(() => {
    if (!product) return null;
    const tbd = product.time_based_discounts?.find((d) => (d.remaining_minutes != null) || (d.remaining_seconds != null));
    if (tbd?.discounted_price != null) return product.price || product.discount_price || null;
    if (product.discount_price) return product.price || null;
    return null;
  }, [product]);

  const effectiveMaxLimit = maxQuantity === null || maxQuantity === 0 ? 999 : Math.max(1, Number(maxQuantity));
  const existingCartItem = product && cartItems?.find((it) => it?.product?.id === product?.id || it?.id === product?.id);

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
      const result = await addItem(product, quantity, false);
      if (result?.added || result?.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else if (!result?.isGiftSelection) {
        if (result?.errorType === 'MAX_REACHED') {
          setShowMaxReachedToast(true);
        } else {
          setErrorToastMessage(result?.message || t.errorAdd);
          setShowErrorToast(true);
        }
      }
    } catch (error) {
      setErrorToastMessage(t.systemError);
      setShowErrorToast(true);
    } finally {
      setIsAdding(false);
    }
  };

  if (!product) return null;

  return (
    <div className={`smart-sticky-wrapper ${isVisible ? "is-visible" : ""} ${buttonState.buttonText === t.outOfStock ? "d-none d-md-block" : ""}`}>
      <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantity} isStockLimit={isStockLimit} />
      <ErrorToast visible={showErrorToast} onHide={() => setShowErrorToast(false)} message={errorToastMessage} />

      <div className="smart-sticky-container">
        {/* Product Info Section (Hidden image and title on mobile) */}
        <div className="ss-product-info">
          <div className="ss-image-box d-none d-md-block">
            {productImage && (
              <Image
                src={productImage}
                alt={productName}
                width={48}
                height={48}
                unoptimized={typeof productImage === 'string' && productImage.startsWith('http')}
              />
            )}
          </div>
          <div className="ss-details">
            <h6 className={`ss-title d-none d-md-block ${buttonState.buttonText === t.outOfStock ? "full-title" : ""}`}>
              {buttonState.buttonText === t.outOfStock ? productName : (productName.length > 18 ? productName.slice(0, 18) + "..." : productName)}
            </h6>
            {buttonState.buttonText !== t.outOfStock && (
              <div className="ss-price-row">
                <span className={`ss-current-price ${originalPrice ? 'ss-has-discount' : ''}`}>
                  {Number(finalPrice).toLocaleString(t.locale)} TL
                </span>
                {originalPrice && (
                  <span className="ss-old-price">
                    {Number(originalPrice).toLocaleString(t.locale)} TL
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="ss-actions">
          {buttonState.buttonText !== t.outOfStock && (
            <div className="ss-quantity-wrapper">
              <Quantity
                setQuantity={setQuantity}
                initialValue={quantity}
                minQuantity={minQuantity}
                maxQuantity={maxQuantity}
                disabled={soldOut || buttonState.buttonDisabled}
              />
            </div>
          )}
          <button
            className={`ss-submit-btn ${showSuccess ? 'success' : ''} ${buttonState.buttonDisabled ? 'disabled' : ''} ${buttonState.buttonText === t.outOfStock ? 'out-of-stock' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || showSuccess || buttonState.buttonDisabled}
          >
            <span className="btn-label">
              {showSuccess ? t.added : isAdding ? t.adding : buttonState.buttonText}
            </span>
            {showSuccess && <div className="btn-success-overlay">{t.added}</div>}
          </button>
        </div>
      </div>

      <style jsx>{`
        .smart-sticky-wrapper {
          position: fixed;
          z-index: 20;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          pointer-events: none;
        }

        /* Desktop: Floating horizontal card at Bottom Right */
        @media (min-width: 768px) {
          .smart-sticky-wrapper {
            bottom: 30px;
            right: 30px;
            transform: translateX(100px);
          }
          .smart-sticky-wrapper.is-visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateX(0);
          }
          .smart-sticky-container {
            width: 480px; /* More compact width */
            background: #ffffff;
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 20px 14px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .ss-product-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
          }
          .ss-image-box {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: #fdfdfd;
          }
          .ss-details {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start; /* Ensure left alignment */
            min-width: 0;
          }
          .ss-title {
             font-size: 14px;
             font-weight: 500;
             margin: 0 0 6px 0; /* Increased spacing between name and price */
             padding: 0;
             line-height: 1.2;
             color: #333;
          }
          .ss-price-row {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
          }
          
          
        }

        /* Mobile: Always Visible Bar at Bottom */
        @media (max-width: 767px) {
          .smart-sticky-wrapper {
            bottom: 0;
            left: 0;
            right: 0;
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
          .smart-sticky-container {
            background: #fff;
            padding: 10px 12px;
            border-top: 2px solid #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          .ss-product-info {
             flex: 0 0 auto;
             min-width: 90px;
          }
          .ss-price-row {
             flex-direction: column;
             align-items: flex-start;
             gap: 0;
             line-height: 1.1;
          }
          .ss-actions {
             flex: 1;
             display: flex;
             align-items: center;
             justify-content: flex-end;
             gap: 8px;
             min-width: 0;
          }
          .ss-quantity-wrapper {
             flex: 0 0 auto;
          }
          .ss-submit-btn {
             flex: 1;
             width: auto;
             height: 38px !important;
             font-size: 13px !important;
             padding: 0 6px !important;
             min-width: 80px !important;
             max-width: 130px;
          }
          .ss-current-price {
             font-size: 18px !important;
          }
          .ss-old-price {
             font-size: 13px !important;
          }
        }

        .ss-product-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ss-image-box {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 12px;
          overflow: hidden;
          background: #f8f8f8;
        }

        .ss-image-box :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ss-details {
          flex: 1;
          min-width: 0;
        }

        .ss-title {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ss-title.full-title {
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          line-height: 1.4;
        }

        .ss-price-row {
          display: flex;
        }

        .ss-current-price {
          font-size: 16px;
          font-weight: 700;
          color: var(--primary, #3c81b5);
        }

        .ss-current-price.ss-has-discount {
          color: #3c81b5;
        }

        .ss-old-price {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
        }

        .ss-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ss-quantity-wrapper {
          flex-shrink: 0;
        }

        .ss-submit-btn {
          flex: 1;
          height: 38px;
          background: var(--primary, #3c81b5);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          min-width: 110px;
        }

        .ss-submit-btn.success {
          background: #10b981;
        }

        .ss-submit-btn.disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .ss-submit-btn.out-of-stock {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
          opacity: 1 !important;
        }

        .btn-label {
          transition: all 0.3s ease;
        }

        .ss-submit-btn.success .btn-label {
          opacity: 0;
          transform: translateY(-20px);
        }

        .btn-success-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Quantity selector compact scaling */
        .smart-sticky-container :global(.wg-quantity) {
          height: 38px !important;
          background: #f9f9f9;
          border-radius: 8px;
          padding: 2px !important;
        }
        .smart-sticky-container :global(.wg-quantity .btn-quantity) {
          width: 30px !important;
          height: 30px !important;
          line-height: 28px !important;
          font-size: 16px !important;
        }
        .smart-sticky-container :global(.wg-quantity input) {
          height: 30px !important;
          width: 36px !important;
          font-size: 13px !important;
        }

        /* Utility classes for responsive display */
        .d-none { display: none; }
        @media (min-width: 768px) {
            .d-md-block { display: block; }
        }
      `}</style>
    </div>
  );
}
