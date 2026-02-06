"use client";
import React, { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { decodeHtmlEntities, addLazyLoadToDescriptionImages } from "@/utils/stripHtml";
import Slider5 from "./sliders/Slider5";
import { openCartModal } from "@/utils/openCartModal";
import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import { colors, paymentImages, sizeOptions } from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import { useContextElement } from "@/context/Context";
import { useCartStore } from "@/stores/cartStore";
import { getProductButtonState } from "@/utils/productStock";
import { siteConfig } from "@/config/site";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import BirlikteAlNew from "./BirlikteAlNew";
import StarRating from "@/components/common/StarRating";
import ProductVideoPlayer from "./ProductVideoPlayer";

const TOOLTIP_MAX_WIDTH = 360;
const TOOLTIP_MARGIN = 16;

/** Yuvarlak (?) ikonu – tıklanınca protokol açıklamasını gösterir. Tooltip body'de portal ile render edilir; taşma ve z-index sorunu olmaz. */
function ProductProtocolHelp({ description, protocolName }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, maxWidth: TOOLTIP_MAX_WIDTH });
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || typeof document === "undefined") return;
    const el = triggerRef.current;
    const rect = el.getBoundingClientRect();
    const viewW = window.innerWidth;
    const maxW = Math.min(TOOLTIP_MAX_WIDTH, viewW - TOOLTIP_MARGIN * 2);
    let left = rect.left;
    if (left + maxW > viewW - TOOLTIP_MARGIN) left = viewW - maxW - TOOLTIP_MARGIN;
    if (left < TOOLTIP_MARGIN) left = TOOLTIP_MARGIN;
    setPosition({
      top: rect.bottom + 6,
      left,
      maxWidth: maxW,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        const tooltip = document.querySelector(".product-protocol-tooltip");
        if (tooltip && tooltip.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const tooltipEl = open && typeof document !== "undefined" && (
    <div
      role="tooltip"
      className="product-protocol-tooltip"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 10050,
        minWidth: "200px",
        maxWidth: position.maxWidth,
        padding: "12px 14px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
        fontSize: "13px",
        lineHeight: 1.55,
        color: "#374151",
      }}
    >
      {protocolName && (
        <div style={{ fontWeight: 600, marginBottom: "6px", color: "#111" }}>{protocolName}</div>
      )}
      <div
        className="product-protocol-tooltip__content"
        dangerouslySetInnerHTML={{ __html: description ? decodeHtmlEntities(description) : "" }}
      />
    </div>
  );

  return (
    <>
      <span ref={triggerRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Daha fazla bilgi"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid #888",
            background: "#fff",
            color: "#555",
            fontSize: "12px",
            fontWeight: "700",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ?
        </button>
      </span>
      {tooltipEl && ReactDOM.createPortal(tooltipEl, document.body)}
    </>
  );
}

export default function Details9({ product }) {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const { addItem } = useCartStore();
  const cartItems = useCartStore((s) => s.items);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [showShortDescription, setShowShortDescription] = useState(false);

  useEffect(() => {
    const check = () => setShowShortDescription(typeof window !== "undefined" && window.innerWidth >= 992);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Icon mapping


  // API'den gelen info_messages'ı kullan
  const announcementMessages = useMemo(() => {
    // product objesinde info_messages var mı kontrol et
    const infoMessages = product?.info_messages;

    if (infoMessages && Array.isArray(infoMessages) && infoMessages.length > 0) {
      return infoMessages.map(msg => ({
        type: msg.type || '',
        message: msg.message || '',
        icon: msg.icon || '',
        shipping_date: msg.shipping_date || null
      }));
    }

    return [];
  }, [product?.info_messages]);


  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!announcementMessages || announcementMessages.length <= 1) {
      setCurrentMessageIndex(0);
      setIsAnimating(false);
      return;
    }

    // İlk mesajı göster
    setCurrentMessageIndex(0);
    setIsAnimating(false);

    const interval = setInterval(() => {
      setIsAnimating(true);
      // Animasyon başladıktan sonra index'i değiştir
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % announcementMessages.length);
        // Animasyon bitince animating state'ini sıfırla
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 300); // Animasyon süresi
    }, 4000); // Her 4 saniyede bir değiş

    return () => clearInterval(interval);
  }, [announcementMessages]);

  // Sadece API varyasyonları varsa göster; yoksa varyasyon alanı hiç render olmasın
  const hasVariations = useMemo(() => {
    return product && Array.isArray(product.variations) && product.variations.length > 0;
  }, [product?.variations]);

  // Ana ürün varyasyonu (kendi ürünü), sadece API varyasyonları varsa kullan
  const baseVariation = useMemo(() => {
    if (!product || !hasVariations) return null;
    const categorySlug =
      product.primary_category?.slug || (Array.isArray(product.categories) && product.categories[0]?.slug) || "urunler";
    return {
      name: product.name || product.title || "",
      slug: product.slug || "",
      category_slug: categorySlug,
      is_in_stock: product.is_in_stock,
      is_pre_order: product.is_pre_order,
      price: product.price,
      discount_price: product.discount_price,
      cover_image: product.images?.[0] || product.gallery_images?.[0] || null,
    };
  }, [product, hasVariations]);

  // API'den gelen varyasyonlar + ana ürün (sadece API varyasyonu varsa)
  const allVariations = useMemo(() => {
    if (!hasVariations) return [];
    const list = [];
    if (baseVariation && baseVariation.slug) {
      list.push(baseVariation);
    }
    product.variations.forEach((variation) => {
      if (!variation) return;
      const slug = variation.slug || "";
      const category_slug = variation.category_slug || baseVariation?.category_slug || "urunler";
      // Ana ürünle aynı slug + kategori ise tekrar ekleme
      if (baseVariation && slug === baseVariation.slug && category_slug === baseVariation.category_slug) {
        return;
      }
      list.push({
        ...variation,
        slug,
        category_slug,
      });
    });
    return list;
  }, [product, baseVariation, hasVariations]);

  // Min/Max: API ne veriyorsa onu uygula
  // max_purchase_quantity = 0 ise sınırsız (null), değilse o değere kadar sınırlı
  const minQuantity = Number.isFinite(product?.min_purchase_quantity) ? Number(product.min_purchase_quantity) : 1;
  const rawMax =
    product?.max_purchase_quantity === null || product?.max_purchase_quantity === undefined
      ? null
      : Number(product.max_purchase_quantity);
  // 0 ise sınırsız (null), değilse o değeri kullan
  const maxQuantity = rawMax === 0 ? null : (rawMax === null || Number.isNaN(rawMax) ? null : Math.max(rawMax, minQuantity));
  const [quantity, setQuantity] = useState(minQuantity);

  const existingCartItem = useMemo(() => {
    return cartItems?.find((it) => it?.product?.id === product?.id || it?.id === product?.id) || null;
  }, [cartItems, product?.id]);

  // Süreli indirim kontrolü
  const timeBasedDiscount = useMemo(() => {
    if (product.time_based_discounts && product.time_based_discounts.length > 0) {
      const activeDiscount = product.time_based_discounts.find(
        (discount) => discount.remaining_minutes !== null && discount.remaining_minutes !== undefined
      );
      return activeDiscount || null;
    }
    return null;
  }, [product.time_based_discounts]);

  // Countdown için target date hesapla (remaining_minutes dakika sonrası)
  const countdownTargetDate = useMemo(() => {
    if (timeBasedDiscount && timeBasedDiscount.remaining_minutes !== null) {
      const now = new Date();
      const targetDate = new Date(now.getTime() + timeBasedDiscount.remaining_minutes * 60 * 1000);
      return targetDate.toISOString();
    }
    return null;
  }, [timeBasedDiscount]);

  // Fiyat hesaplama: önce time_based_discount, sonra normal discount_price, son olarak price
  const finalPrice = useMemo(() => {
    if (timeBasedDiscount && timeBasedDiscount.discounted_price) {
      return timeBasedDiscount.discounted_price;
    }
    return product.discount_price || product.price || 0;
  }, [timeBasedDiscount, product.discount_price, product.price]);

  // Orijinal fiyat (indirimli fiyat varsa)
  const originalPrice = useMemo(() => {
    if (timeBasedDiscount && timeBasedDiscount.discounted_price) {
      return product.price || product.discount_price || 0;
    }
    if (product.discount_price) {
      return product.price || 0;
    }
    return null;
  }, [timeBasedDiscount, product.price, product.discount_price]);
  const handleColor = (color) => {
    const updatedColor = colors.filter((elm) => elm.value.toLowerCase() == color.toLowerCase())[0];
    if (updatedColor) {
      setCurrentColor(updatedColor);
    }
  };

  // Stok durumuna göre buton metni ve durumu
  const buttonState = useMemo(() => {
    return getProductButtonState(product);
  }, [product]);

  const handleAddToCartAnimated = async () => {
    if (isAdding || showSuccess) return;

    // Quantity state'inden miktarı al
    let qtyToAdd = quantity;

    // Min/Max kontrolü (alert vermeden sessizce sınırla)
    if (qtyToAdd < minQuantity) {
      qtyToAdd = minQuantity;
    }

    // Global max veya ürün max'ı hangisi küçükse ona göre sınırla
    const GLOBAL_MAX = 99999;
    const effectiveMaxLimit = maxQuantity === null || maxQuantity === 0 ? GLOBAL_MAX : Math.min(maxQuantity, GLOBAL_MAX);

    if (qtyToAdd > effectiveMaxLimit) {
      qtyToAdd = effectiveMaxLimit;
    }

    // Sepetteki mevcut miktarı kontrol et
    if (effectiveMaxLimit > 0) {
      const currentQtyInCart = existingCartItem?.quantity || 0;

      // Eğer zaten sınırdaysa ekleme yapma, bildirim göster
      if (currentQtyInCart >= effectiveMaxLimit) {
        setShowMaxReachedToast(true);
        return;
      }

      // Toplam miktar max'ı aşıyorsa, sadece max'a tamamlayacak kadar ekle
      if (currentQtyInCart + qtyToAdd > effectiveMaxLimit) {
        qtyToAdd = effectiveMaxLimit - currentQtyInCart;
      }
    }

    setIsAdding(true);
    try {
      const result = await addItem(product, qtyToAdd, false);
      if (result?.added) {
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
    <section className=" pt_0" style={{ maxWidth: "100vw", overflow: "clip" }}>
      <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantity} />
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap ">
                <div className="thumbs-slider">
                  <Slider5
                    handleColor={handleColor}
                    currentColor={currentColor.value}
                    galleryImages={product.images || product.gallery_images || []}
                    model3dUrl={product.model_3d_url}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h5>{product.title ? product.title : "Cotton jersey top"}</h5>
                  </div>

                  {/* Rating gösterimi: StarRating component + Değerlendirme butonu */}
                  {((product.reviews?.average_rating || product.rating || product.average_rating || 0) > 0 ||
                    (product.reviews?.count || product.reviews_count || product.review_count || 0) > 0) && (
                      <div className="tf-product-info-rating" style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <StarRating
                            rating={product.reviews?.average_rating || product.rating || product.average_rating || 0}
                            reviewCount={product.reviews?.count || product.reviews_count || product.review_count || 0}
                            size="large"
                            showReviewCount={false}
                          />
                          {(product.reviews?.count || product.reviews_count || product.review_count) > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                window.location.hash = "#product-reviews";
                                setTimeout(() => document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth" }), 50);
                              }}
                              style={{ fontSize: "13px", color: "#888", display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              <b style={{ fontWeight: "600", color: "#777" }}>{product.reviews?.count || product.reviews_count || product.review_count} </b>
                              Değerlendirme
                              {product.reviews?.fotografli_yorum && (
                                <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "2px" }} title="Fotoğraflı yorumlar">
                                  <Image src="/images/products/camera.png" alt="Fotoğraflı yorumlar" width={28} height={18} style={{ flexShrink: 0, display: "block" }} />
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                        {product.bundle_items && Array.isArray(product.bundle_items) && product.bundle_items.length > 0 && (
                          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                            (Bu puan paketteki ürünlerin ortalama puanıdır.)
                          </div>
                        )}
                      </div>
                    )}

                  {/* Fiyat - sadece PC’de (mobilde sticky bar’da) */}
                  <div className="tf-product-info-price d-none d-lg-block" style={{ marginBottom: "16px" }}>
                    <span className="price-on-sale" style={{ fontSize: "20px", fontWeight: "700", color: originalPrice ? "#0bc15c" : "var(--primary, #3c81b5)" }}>
                      {Number(finalPrice).toLocaleString("tr-TR")} TL
                    </span>
                    {originalPrice != null && originalPrice > finalPrice && (
                      <span className="compare-at-price" style={{ fontSize: "15px", color: "#999", textDecoration: "line-through", marginLeft: "8px" }}>
                        {Number(originalPrice).toLocaleString("tr-TR")} TL
                      </span>
                    )}
                  </div>

                  <div className="tf-product-info-badges">
                    <div className="product-status-content">

                      <div className="announcement-messages-wrapper">
                        {announcementMessages && announcementMessages.length > 0 ? (
                          announcementMessages.map((msg, idx) => {
                            const isActive = idx === currentMessageIndex;
                            const isNext = idx === (currentMessageIndex + 1) % announcementMessages.length;
                            const isAnimatingOut = isActive && isAnimating;

                            return (
                              <p
                                key={idx}
                                className={`fw-6 announcement-message ${isActive ? "active" : ""} ${isNext && isAnimating ? "next" : ""} ${isAnimatingOut ? "animating-out" : ""}`}
                              >
                                {msg.message}
                              </p>
                            );
                          })
                        ) : (
                          <p className="fw-6 announcement-message active">Mesaj yok</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {timeBasedDiscount && countdownTargetDate && (
                    <div className="tf-product-info-countdown">
                      <div className="countdown-wrap">
                        <div className="countdown-title">
                          <i className="icon-time tf-ani-tada" />
                          <p>İNDİRİM BİTMEDEN SATIN ALIN</p>
                        </div>
                        <div className="tf-countdown style-1">
                          <div className="js-countdown">
                            <CountdownComponent
                              labels="Gün :,Saat :,Dakika :,Saniye"
                              targetDate={countdownTargetDate}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Birlikte Al - desktop: burada; mobil: açıklama (tab) alanından sonra (sayfada) */}
                  {hasVariations && (
                    <div className="d-none d-md-block" style={{ paddingLeft: "3px" }}>
                      <BirlikteAlNew
                        variations={allVariations}
                        currentSlug={product.slug}
                        currentCategorySlug={
                          product.primary_category?.slug ||
                          (Array.isArray(product.categories) && product.categories[0]?.slug) ||
                          "urunler"
                        }
                      />
                    </div>
                  )}

                  {/* Kısa Açıklama - sadece desktop (mobilde render etme) */}
                  {showShortDescription && product.short_description && (
                    <>
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          .tf-product-info-short-description .short-description-content ul {
                            list-style-type: disc !important;
                            margin-left: 20px !important;
                            margin-top: 10px !important;
                            margin-bottom: 10px !important;
                            padding-left: 20px !important;
                          }
                          .tf-product-info-short-description .short-description-content li {
                            list-style-type: disc !important;
                            margin-bottom: 6px !important;
                            display: list-item !important;
                          }
                          .tf-product-info-short-description .short-description-content ol {
                            list-style-type: decimal !important;
                            margin-left: 20px !important;
                            margin-top: 10px !important;
                            margin-bottom: 10px !important;
                            padding-left: 20px !important;
                          }
                          .tf-product-info-short-description .short-description-content ol li {
                            list-style-type: decimal !important;
                            display: list-item !important;
                          }
                          .tf-product-info-short-description .short-description-content p {
                            margin-bottom: 10px !important;
                          }
                          .tf-product-info-short-description .short-description-content p:last-child {
                            margin-bottom: 0 !important;
                          }
                          .tf-product-info-short-description .short-description-content strong {
                            font-weight: 600 !important;
                          }
                        `
                      }} />
                      <div className="tf-product-info-short-description" style={{ marginTop: "24px", marginBottom: "24px", padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                        <div
                          className="short-description-content"
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.6",
                            color: "#333"
                          }}
                          dangerouslySetInnerHTML={{ __html: addLazyLoadToDescriptionImages(decodeHtmlEntities(product.short_description)) }}
                        />
                      </div>
                    </>
                  )}

                  {/* Ürün protokolü: "Bu ürün [görsel] ile çalışmaktadır." + (?) ile açıklama */}
                  {product.product_protocol && (
                    <div className="tf-product-info-protocol" style={{ marginTop: "16px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", color: "#333", lineHeight: 1.5 }}>
                          Bu ürün{" "}
                          {product.product_protocol.image?.url ? (
                            <Image
                              src={product.product_protocol.image.url}
                              alt={product.product_protocol.image?.alt_text || product.product_protocol.name || "Protokol"}
                              width={32}
                              height={32}
                              style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
                              unoptimized={String(product.product_protocol.image.url).startsWith("http")}
                            />
                          ) : (
                            <strong>{product.product_protocol.name}</strong>
                          )}{" "}
                          ile çalışmaktadır.
                        </span>
                        {product.product_protocol.description && (
                          <ProductProtocolHelp
                            description={product.product_protocol.description}
                            protocolName={product.product_protocol.name}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()} className="">
                      <div className="tf-product-buy-actions d-none d-md-flex" style={{ alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="tf-product-info-quantity" style={{ margin: 0 }}>
                          <Quantity setQuantity={setQuantity} minQuantity={minQuantity} maxQuantity={maxQuantity} disabled={buttonState.buttonDisabled} />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddToCartAnimated}
                          disabled={isAdding || showSuccess || buttonState.buttonDisabled}
                          className={`main-cart-btn ${showSuccess ? "success-animation" : ""} ${buttonState.buttonText === "Stokta Yok" ? "out-of-stock" : ""}`}
                        >
                          <span className="button-text-main">
                            {showSuccess ? "Sepete Eklendi" : isAdding ? "Ekleniyor..." : buttonState.buttonText}
                          </span>
                          {showSuccess && <span className="button-text-slide">Sepete Eklendi</span>}
                        </button>

                      </div>

                      {/* <div className="w-100">
                        <a href="#" className="btns-full">
                          Sepete Ekle{" "}
                          <Image
                            alt="image"
                            src="/images/payments/paypal.png"
                            width={64}
                            height={18}
                          />
                        </a>
                        <a href="#" className="payment-more-option">
                          Daha fazla ödeme seçeneği
                        </a>
                      </div> */}
                    </form>
                  </div>

                  <style jsx global>{`
                    /* Trendyol tarzı animasyonlu mesajlar */
                    .product-status-content {
                      position: relative;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      overflow: hidden;
                      min-height: 24px;
                    }

                    .announcement-messages-wrapper {
                      position: relative;
                      flex: 1;
                      overflow: hidden;
                      min-height: 24px;
                    }

                    .announcement-message {
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      opacity: 0;
                      transform: translateY(100%);
                      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      pointer-events: none;
                    }

                    .announcement-message.active {
                      opacity: 1;
                      transform: translateY(0);
                      position: relative;
                      pointer-events: auto;
                    }

                    /* Animasyon sırasında aktif mesaj yukarı kayıyor */
                    .announcement-message.active.animating-out {
                      opacity: 0;
                      transform: translateY(-100%);
                      position: absolute;
                    }

                    /* Yeni mesaj alttan geliyor */
                    .announcement-message.next {
                      opacity: 1;
                      transform: translateY(0);
                      position: relative;
                      pointer-events: auto;
                    }

                    /* Varyasyon chip/buton: net görünüm, seçili = primary, değil = gri chip */
                    .tf-product-info-variant-picker .variant-picker-values .style-text {
                      display: inline-flex !important;
                      align-items: center !important;
                      justify-content: center !important;
                      min-height: 40px !important;
                      padding: 8px 16px !important;
                      border-radius: 10px !important;
                      border: 1px solid #e0e0e0 !important;
                      background: #f5f5f5 !important;
                      color: #333 !important;
                      font-size: 14px !important;
                      font-weight: 500 !important;
                      cursor: pointer !important;
                      transition: background 0.2s, border-color 0.2s, color 0.2s !important;
                      box-shadow: none !important;
                      text-decoration: none !important;
                    }
                    .tf-product-info-variant-picker .variant-picker-values .style-text p {
                      margin: 0 !important;
                      color: inherit !important;
                      font-size: inherit !important;
                      font-weight: inherit !important;
                    }
                    /* Seçili OLMAYAN: hover’da daha belirgin */
                    .tf-product-info-variant-picker
                      .variant-picker-values
                      input[type="radio"]:not(:checked)
                      + .style-text:hover,
                    .tf-product-info-variant-picker .variant-picker-values a.style-text:hover {
                      background: #eee !important;
                      border-color: var(--primary, #3c81b5) !important;
                      color: #111 !important;
                    }
                    /* Seçili varyasyon: primary dolgu, beyaz yazı */
                    .tf-product-info-variant-picker
                      .variant-picker-values
                      input[type="radio"]:checked
                      + .style-text {
                      background: var(--primary, #3c81b5) !important;
                      border-color: var(--primary, #3c81b5) !important;
                      color: #fff !important;
                      pointer-events: none;
                      cursor: default !important;
                    }
                    .tf-product-info-variant-picker
                      .variant-picker-values
                      input[type="radio"]:checked
                      + .style-text p {
                      color: #fff !important;
                    }

                    /* Anasayfa ile aynı Sepete Eklendi animasyonu */
                    .tf-product-buy-actions {
                      display: flex;
                      align-items: center;
                      gap: 12px;
                      width: 100%;
                    }

                    /* Wishlist butonu: anasayfadaki gibi yuvarlak ikon */
                    .tf-product-buy-actions .wish-action-btn {
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
                      padding: 0;
                    }

                    .tf-product-info-buy-button .main-cart-btn {
                      height: 44px;
                      border-radius: 12px;
                      font-size: 13px;
                      font-weight: 600;
                      overflow: hidden;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      padding: 0 24px;
                      border: 1px solid var(--primary);
                      background: var(--primary);
                      color: #fff;
                      cursor: pointer;
                      position: relative;
                      transition: all 0.3s ease;
                      flex: 1;
                    }

                    .tf-product-info-buy-button .main-cart-btn:disabled {
                      opacity: 1 !important;
                      cursor: not-allowed;
                    }

                    .tf-product-info-buy-button .main-cart-btn .button-text-main,
                    .tf-product-info-buy-button .main-cart-btn .button-text-slide {
                      width: 100%;
                      text-align: center;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    }

                    .tf-product-info-buy-button .main-cart-btn.success-animation {
                      background: #10b981;
                      border-color: #10b981;
                      overflow: hidden;
                    }

                    .tf-product-info-buy-button .main-cart-btn.success-animation .button-text-main {
                      opacity: 0;
                      transform: translateY(100%);
                      transition: opacity 0.2s, transform 0.2s;
                    }

                    .tf-product-info-buy-button .main-cart-btn.success-animation .button-text-slide {
                      position: absolute;
                      inset: 0;
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
                  <div className="tf-product-info-extra-link">
                    {/* <a
                      href="#compare_color"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <Image
                          alt="image"
                          src="/images/item/compare.svg"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="text fw-6">Compare color</div>
                    </a> */}
                    {/* <a href="#ask_question" data-bs-toggle="modal" className="tf-product-extra-icon">
                      <div className="icon">
                        <i className="icon-question" />
                      </div>
                      <div className="text fw-6">Soru sor</div>
                    </a> */}
                    {/* <a href="#delivery_return" data-bs-toggle="modal" className="tf-product-extra-icon">
                      <div className="icon">
                        <svg
                          className="d-inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          width={22}
                          height={18}
                          viewBox="0 0 22 18"
                          fill="currentColor"
                        >
                          <path d="M21.7872 10.4724C21.7872 9.73685 21.5432 9.00864 21.1002 8.4217L18.7221 5.27043C18.2421 4.63481 17.4804 4.25532 16.684 4.25532H14.9787V2.54885C14.9787 1.14111 13.8334 0 12.4255 0H9.95745V1.69779H12.4255C12.8948 1.69779 13.2766 2.07962 13.2766 2.54885V14.5957H8.15145C7.80021 13.6052 6.85421 12.8936 5.74468 12.8936C4.63515 12.8936 3.68915 13.6052 3.33792 14.5957H2.55319C2.08396 14.5957 1.70213 14.2139 1.70213 13.7447V2.54885C1.70213 2.07962 2.08396 1.69779 2.55319 1.69779H9.95745V0H2.55319C1.14528 0 0 1.14111 0 2.54885V13.7447C0 15.1526 1.14528 16.2979 2.55319 16.2979H3.33792C3.68915 17.2884 4.63515 18 5.74468 18C6.85421 18 7.80021 17.2884 8.15145 16.2979H13.423C13.7742 17.2884 14.7202 18 15.8297 18C16.9393 18 17.8853 17.2884 18.2365 16.2979H21.7872V10.4724ZM16.684 5.95745C16.9494 5.95745 17.2034 6.08396 17.3634 6.29574L19.5166 9.14894H14.9787V5.95745H16.684ZM5.74468 16.2979C5.27545 16.2979 4.89362 15.916 4.89362 15.4468C4.89362 14.9776 5.27545 14.5957 5.74468 14.5957C6.21392 14.5957 6.59575 14.9776 6.59575 15.4468C6.59575 15.916 6.21392 16.2979 5.74468 16.2979ZM15.8298 16.2979C15.3606 16.2979 14.9787 15.916 14.9787 15.4468C14.9787 14.9776 15.3606 14.5957 15.8298 14.5957C16.299 14.5957 16.6809 14.9776 16.6809 15.4468C16.6809 15.916 16.299 16.2979 15.8298 16.2979ZM18.2366 14.5957C17.8853 13.6052 16.9393 12.8936 15.8298 12.8936C15.5398 12.8935 15.252 12.943 14.9787 13.04V10.8511H20.0851V14.5957H18.2366Z" />
                        </svg>
                      </div>
                      <div className="text fw-6">Teslimat &amp; İade</div>
                    </a> */}
                    {/* <a href="#share_social" data-bs-toggle="modal" className="tf-product-extra-icon" title="Paylaş" aria-label="Paylaş">
                      <div className="icon">
                        <i className="icon-share" />

                      </div>
                      <div className="text fw-6">Paylaş</div>
                    </a> */}
                    {/* <a
                      href={`https://api.whatsapp.com/send?phone=${(siteConfig?.contact?.phone?.whatsapp?.tel || "905526428208").replace(/\D/g, "")}&text=${encodeURIComponent(
                        `${product?.name || product?.title || "Ürün"} hakkında bilgi almak istiyorum.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tf-product-extra-icon"
                      aria-label="WhatsApp ile soru sor"
                    >
                      <div className="icon tf-whatsapp-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div className="text fw-6">WhatsApp</div>
                    </a> */}

                  </div>

                  {/* Bundle ürünleri - Pairs well with */}
                  {product.bundle_items &&
                    Array.isArray(product.bundle_items) &&
                    product.bundle_items.length > 0 && (
                      <div className="tf-product-bundle-wrap">
                        <div className="title">Paket içerisindeki ürünler</div>
                        <div className="tf-product-form-bundle">
                          <div className="tf-bundle-products">
                            {product.bundle_items.map((item, i) => {
                              const categorySlug =
                                item.categories?.[0]?.slug || "";
                              const productUrl = `/magaza/${categorySlug}/${item.slug}`;
                              const imgUrl =
                                item.cover_image?.url ||
                                item.cover_image?.thumbnail_url ||
                                "/images/products/placeholder.jpg";
                              const displayPrice = item.bundle_discount_price
                                ? item.bundle_discount_price
                                : item.normal_price;
                              return (
                                <div
                                  key={item.product_id}
                                  className={`tf-bundle-product-item item-has-checkox check ${i < product.bundle_items.length - 1 ? "pb_15 line mb_15" : ""}`}
                                >
                                  <div className="tf-product-bundle-image">
                                    <Link
                                      className="radius-10 overflow-hidden"
                                      href={productUrl}
                                    >
                                      <Image
                                        alt={item.product_name}
                                        src={imgUrl}
                                        width={713}
                                        height={891}
                                        unoptimized={
                                          imgUrl.startsWith("http")
                                        }
                                      />
                                    </Link>
                                  </div>
                                  <div className="tf-product-bundle-infos">
                                    {/* 1. İsim - ürün detaydaki gibi */}
                                    <span className="tf-product-bundle-title">
                                      {item.product_name}
                                      {item.quantity > 1 && (
                                        <span className="text-muted ms-1">
                                          x{item.quantity}
                                        </span>
                                      )}
                                    </span>
                                    {/* 2. Yıldız puanı */}
                                    {((item.average_rating ?? 0) > 0 || (item.review_count ?? 0) > 0) && (
                                      <div style={{ marginTop: "6px", marginBottom: "6px" }}>
                                        <StarRating
                                          rating={item.average_rating ?? 0}
                                          reviewCount={item.review_count ?? 0}
                                          size="small"
                                        />
                                      </div>
                                    )}
                                    {/* 3. Fiyat */}
                                    <div className="tf-product-bundle-price" style={{ fontSize: "15px" }}>
                                      {item.bundle_discount_price != null &&
                                        item.bundle_discount_price !==
                                        item.normal_price ? (
                                        <>
                                          <div className="price price-on-sale">
                                            {typeof item.bundle_discount_price ===
                                              "number"
                                              ? `${item.bundle_discount_price.toLocaleString("tr-TR")} TL`
                                              : item.bundle_discount_price}
                                          </div>
                                          <div className="compare-at-price">
                                            {item.normal_price.toLocaleString("tr-TR")} TL
                                            {typeof item.normal_price ===
                                              "number"
                                              ? item.normal_price.toLocaleString(
                                                "tr-TR"
                                              )
                                              : item.normal_price}
                                          </div>
                                        </>
                                      ) : (
                                        <div className="price">
                                          {typeof displayPrice === "number"
                                            ? `${displayPrice.toLocaleString("tr-TR")} TL`
                                            : displayPrice}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StickyItem
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        minQuantity={minQuantity}
        maxQuantity={maxQuantity}
        soldOut={buttonState.buttonDisabled && buttonState.buttonText === "Stokta Yok"}
      />

      {/* Video Player */}
      <ProductVideoPlayer influencerVideos={product?.influencer_videos || []} />
    </section>
  );
}
