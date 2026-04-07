import Image from "next/image";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useCartStore } from "@/stores/cartStore";
import { getProductButtonState } from "@/utils/productStock";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import ErrorToast from "@/components/common/ErrorToast";
import Quantity from "./Quantity";
import { useLangStore } from "@/stores/langStore";

export default function StickyItem({
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
  const [isMobile, setIsMobile] = useState(false);
  const stickyRef = useRef(null);
  const observerRef = useRef(null);

  const translations = {
    tr: {
      added: "Sepete Eklendi",
      adding: "Ekleniyor...",
      errorAdd: "Sepete eklenirken bir hata oluştu.",
      systemError: "Sistemsel bir hata oluştu. Lütfen tekrar deneyin.",
      outOfStock: "Stokta Yok",
      productLabel: "Ürün",
      locale: "tr-TR"
    },
    en: {
      added: "Added to Cart",
      adding: "Adding...",
      errorAdd: "An error occurred while adding to cart.",
      systemError: "A system error occurred. Please try again.",
      outOfStock: "Out of Stock",
      productLabel: "Product",
      locale: "en-US"
    }
  };

  const t = translations[lang] || translations.tr;

  // Mobil kontrolü (767px)
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 767);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Global sepet başarısı dinleyicisi (Hediye seçimi sonrası vb. animasyonu tetiklemek için)
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
  const displayProduct = product;
  const productName = product?.name || product?.title;

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
    return "";
  };
  const productImage = getImageUrl();
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

  const totalPrice = finalPrice;
  const totalOriginalPrice = originalPrice;

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
        if (result?.added || result?.success) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else if (result?.isGiftSelection) {
          return;
        } else if (result?.errorType === 'MAX_REACHED') {
          setShowMaxReachedToast(true);
        } else if (result?.message) {
          setErrorToastMessage(result.message);
          setShowErrorToast(true);
        } else {
          setErrorToastMessage(t.errorAdd);
          setShowErrorToast(true);
        }
      }
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      setErrorToastMessage(error?.message || t.systemError);
      setShowErrorToast(true);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`tf-sticky-btn-atc ${isVisible ? "show" : ""}`} ref={stickyRef}>
      <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantity} isStockLimit={isStockLimit} />
      <ErrorToast visible={showErrorToast} onHide={() => setShowErrorToast(false)} message={errorToastMessage} />
      <div className="container">
        <div className="tf-height-observer">
          <div className="tf-sticky-atc-image d-none d-md-flex">
            {productImage && (
              <Image
                src={productImage}
                alt={productName || t.productLabel}
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
              {productName || t.productLabel}
            </p>
            <div className={`tf-sticky-atc-price-wrap ${totalOriginalPrice != null && totalOriginalPrice > totalPrice ? "has-discount" : ""}`}>
              <span className="price-on-sale">{Number(totalPrice).toLocaleString(t.locale)} TL</span>
              {totalOriginalPrice != null && totalOriginalPrice > totalPrice && (
                <span className="compare-at-price">{Number(totalOriginalPrice).toLocaleString(t.locale)} TL</span>
              )}
            </div>
          </div>
          <div className="tf-sticky-atc-infos">
            <form onSubmit={(e) => e.preventDefault()} className="">
              <div className="tf-sticky-atc-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="d-none d-md-block">
                  <Quantity
                    setQuantity={setQuantity}
                    initialValue={quantity}
                    minQuantity={minQuantity}
                    maxQuantity={maxQuantity}
                    disabled={soldOut || buttonState.buttonDisabled}
                  />
                </div>
                {soldOut || buttonState.buttonDisabled ? (
                  <button
                    type="button"
                    disabled
                    className={`sticky-atc-btn ${buttonState.buttonText === t.outOfStock ? "sticky-atc-btn--out-of-stock" : ""}`}
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
                      {showSuccess ? t.added : isAdding ? t.adding : buttonState.buttonText}
                    </span>
                    {showSuccess && <span className="sticky-atc-btn__slide">{t.added}</span>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx>{`
        .tf-height-observer {
          display: flex;
          align-items: center;
          width: 100%;
        }
        
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
        
        .tf-sticky-atc-mid {
          flex-shrink: 0;
          margin-right: 12px;
        }
        
        .tf-sticky-atc-title-line {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }
        
        .tf-sticky-atc-price-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .tf-sticky-atc-price-wrap .price-on-sale {
          font-size: 17px;
          font-weight: 700;
          color: var(--primary, #1c355e);
          white-space: nowrap;
        }
        .tf-sticky-atc-price-wrap.has-discount .price-on-sale {
          color: #0bc15c;
        }
        .tf-sticky-atc-price-wrap .compare-at-price {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
          white-space: nowrap;
        }
        
        .tf-sticky-atc-infos {
          margin-left: auto;
        }
        
        .tf-sticky-atc-btns {
          width: 100%;
        }

        .sticky-atc-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          background: var(--primary, #3c81b5);
          color: #fff;
          padding: 0 16px;
          height: 40px;
          font-size: 14px;
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
        }
        .sticky-atc-btn__text,
        .sticky-atc-btn__slide {
          display: block;
          width: 100%;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sticky-atc-btn--success {
          background: #10b981 !important;
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
          animation: stickyBtnSlide 2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes stickyBtnSlide {
          0% { transform: translateY(100%); opacity: 0; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        /* Mobil */
        @media (max-width: 767px) {
          .tf-sticky-atc-mid {
            margin-right: 8px;
          }
          .tf-sticky-atc-infos {
            max-width: 60%;
            flex: 1;
          }
          .sticky-atc-btn {
            font-size: 13px;
            padding: 0 12px;
            height: 44px;
          }
          .tf-sticky-atc-btns {
            gap: 6px !important;
          }
        }
      `}</style>
    </div>
  );
}
