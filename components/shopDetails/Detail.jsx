"use client";
import React, { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { decodeHtmlEntities, addLazyLoadToDescriptionImages } from "@/utils/stripHtml";
import Slider from "./sliders/Slider";
import Image from "next/image";
import { colors } from "@/data/singleProductOptions";
import CountdownComponent from "../common/Countdown";
import SmartStickyBar from "./SmartStickyBar";
import Quantity from "./Quantity";
import { useCartStore } from "@/stores/cartStore";
import { getProductButtonState } from "@/utils/productStock";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import ErrorToast from "@/components/common/ErrorToast";
import BirlikteAlNew from "./BirlikteAlNew";
import StarRating from "@/components/common/StarRating";
import ProductVideoPlayer from "./ProductVideoPlayer";
import VideoModal from "@/components/common/VideoModal";
import ModelViewerModal from "@/components/modals/ModelViewerModal";
import OverlayCtaButton, { Model3dIcon, PlayIcon, ArrowIcon } from "@/components/common/OverlayCtaButton";
import VolumeDiscount from "./VolumeDiscount";
import InfoTicker from "./InfoTicker";


const TOOLTIP_MAX_WIDTH = 360;
const TOOLTIP_MARGIN = 16;

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

export default function Detail({ product }) {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const { addItem } = useCartStore();
  const cartItems = useCartStore((s) => s.items);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [showShortDescription, setShowShortDescription] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [model3dModalOpen, setModel3dModalOpen] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("");

  useEffect(() => {
    const check = () => setShowShortDescription(typeof window !== "undefined" && window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Global sepet başarısı dinleyicisi (Hediye seçimi sonrası vb. animasyonu tetiklemek için)
  useEffect(() => {
    const handleCartSuccess = (e) => {
      if (e.detail?.productId === product.id) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    };
    window.addEventListener('cart-success', handleCartSuccess);
    return () => window.removeEventListener('cart-success', handleCartSuccess);
  }, [product.id]);

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
  const rawMaxPurchase =
    product?.max_purchase_quantity === null || product?.max_purchase_quantity === undefined
      ? null
      : Number(product.max_purchase_quantity);

  const stockQuantity = (!product?.unlimited_stock && product?.stock_quantity != null)
    ? Number(product.stock_quantity)
    : null;

  // Final max quantity (ikisi arasından en küçük olanı, ama 0 (unlimited) durumuna dikkat ederek)
  const maxQuantity = useMemo(() => {
    let limit = rawMaxPurchase === 0 ? null : rawMaxPurchase;

    // Ön sipariş ürünlerinde stok limitini dikkate alma
    if (!product?.is_pre_order && stockQuantity !== null) {
      if (limit === null) limit = stockQuantity;
      else limit = Math.min(limit, stockQuantity);
    }

    return limit === null ? null : Math.max(limit, minQuantity);
  }, [rawMaxPurchase, stockQuantity, minQuantity, product?.is_pre_order]);

  const isStockLimiting = useMemo(() => {
    if (product?.is_pre_order) return false;
    if (stockQuantity === null) return false;
    if (rawMaxPurchase === 0 || rawMaxPurchase === null) return true;
    return stockQuantity <= rawMaxPurchase;
  }, [stockQuantity, rawMaxPurchase, product?.is_pre_order]);

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
      if (result?.added || result?.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else if (!result?.isGiftSelection) {
        // Hediye seçimi için duraklatılmadıysa ve eklenemediyse hata göster
        setErrorToastMessage(result?.message || "Sepete eklenirken bir hata oluştu.");
        setShowErrorToast(true);
      }
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      setErrorToastMessage(error?.message || "Sistemsel bir hata oluştu. Lütfen tekrar deneyin.");
      setShowErrorToast(true);
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <>
      <section className="pt_0" style={{ maxWidth: "100vw", overflow: "clip" }}>
        <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantity} isStockLimit={isStockLimiting} />
        <ErrorToast visible={showErrorToast} onHide={() => setShowErrorToast(false)} message={errorToastMessage} />
        <div className="tf-main-product section-image-zoom">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="tf-product-media-wrap">
                  <div className="thumbs-slider">
                    <Slider
                      handleColor={handleColor}
                      currentColor={currentColor.value}
                      galleryImages={product.images || product.gallery_images || []}
                      product={product}
                      onOpenModel3d={() => setModel3dModalOpen(true)}
                      onOpenVideo={() => setYoutubeModalOpen(true)}
                    />
                  </div>
                </div>
                <VideoModal
                  isOpen={youtubeModalOpen}
                  onClose={() => setYoutubeModalOpen(false)}
                  videoUrl={product.video_url || ""}
                />
                <ModelViewerModal
                  show={model3dModalOpen}
                  onHide={() => setModel3dModalOpen(false)}
                  modelSrc={product.model_3d_url || product.media?.model_3d_url || ""}
                />
              </div>
              <div className="col-md-6">
                <div className="tf-product-info-wrap position-relative">
                  <div className="tf-zoom-main" />
                  <div className="tf-product-info-list other-image-zoom">
                    <div className="tf-product-info-title">
                      <h5 style={{ fontSize: "30px", fontWeight: "600" }}>{product.title ? product.title : "Şımart Teknoloji"}</h5>
                    </div>

                    {/* Rating gösterimi: Yıldızlar ve Değerlendirme Sayısı - Üstte */}
                    {(product.reviews?.count || product.reviews_count || product.review_count || 0) > 0 && (
                      <div className="tf-product-info-rating" style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <StarRating
                            rating={product.reviews?.average_rating || product.rating || product.average_rating || 0}
                            reviewCount={product.reviews?.count || product.reviews_count || product.review_count || 0}
                            size="large"
                            showReviewCount={false}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              window.location.hash = "#product-reviews";
                              setTimeout(() => document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth" }), 50);
                            }}
                            style={{ fontSize: "13px", color: "#888", display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            <b style={{ fontWeight: "600", color: "#777" }}>{product.reviews?.count || product.reviews_count || product.review_count || 0} </b>
                            Değerlendirme
                            {product.reviews?.fotografli_yorum && (
                              <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "2px" }} title="Fotoğraflı yorumlar">
                                <Image src="/images/products/camera.png" alt="Fotoğraflı yorumlar" width={28} height={18} style={{ flexShrink: 0, display: "block" }} />
                              </span>
                            )}
                          </button>
                        </div>
                        {product.bundle_items && Array.isArray(product.bundle_items) && product.bundle_items.length > 0 && (
                          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                            (Bu puan paketteki ürünlerin ortalama puanıdır.)
                          </div>
                        )}
                      </div>
                    )}

                    <div className="tf-product-info-price d-none d-md-block" style={{ marginBottom: "16px", width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "nowrap", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="price-on-sale" style={{ fontSize: "20px", fontWeight: "700", color: originalPrice ? "#0bc15c" : "var(--primary, #3c81b5)" }}>
                            {Number(finalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: Number(finalPrice) % 1 === 0 ? 0 : 2 })} TL
                          </span>
                          {originalPrice != null && originalPrice > finalPrice && (
                            <span className="compare-at-price" style={{ fontSize: "16px", color: "#999", textDecoration: "line-through" }}>
                              {Number(originalPrice).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: Number(originalPrice) % 1 === 0 ? 0 : 2 })} TL
                            </span>
                          )}
                        </div>

                        {/* Ürün protokolü - sağa yaslanmış */}
                        {product.product_protocol && (
                          <div className="d-none d-lg-flex" style={{ alignItems: "center", gap: "4px", flexShrink: 0 }}>
                            <span style={{ fontSize: "14px", color: "#666", lineHeight: 1.5, whiteSpace: "nowrap" }}>
                              Bu ürün{" "}
                              {product.product_protocol.image?.url ? (
                                <Image
                                  src={product.product_protocol.image.url}
                                  alt={product.product_protocol.image?.alt_text || product.product_protocol.name || "Protokol"}
                                  width={20}
                                  height={20}
                                  style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain", marginLeft: "2px", marginRight: "2px" }}
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
                        )}
                      </div>
                    </div>

                    {/* Yeni Sade Bilgi Kaydırağı */}
                    {announcementMessages && announcementMessages.length > 0 && (
                      <div style={{ marginBottom: "12px" }}>
                        <InfoTicker messages={announcementMessages} />
                      </div>
                    )}

                    {/* Ürün Protokolü - Sadece mobilde duyuru altında, masaüstünde fiyatın yanında */}
                    {product.product_protocol && (
                      <div className="d-lg-none">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            Bu ürün{" "}
                            {product.product_protocol.image?.url ? (
                              <Image
                                src={product.product_protocol.image.url}
                                alt={product.product_protocol.image?.alt_text || product.product_protocol.name || "Protokol"}
                                width={18}
                                height={18}
                                style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain", margin: "0 2px" }}
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

                    {timeBasedDiscount && countdownTargetDate && (
                      <div className="tf-product-info-countdown" style={{ marginBottom: "24px" }}>
                        <CountdownComponent
                          targetDate={countdownTargetDate}
                          variant="soft"
                          title="Sınırlı Süre için geçerli"
                          subtitle="İndirim bitmeden hemen satın alın!"
                        />
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

                    {/* Desktop Medya Butonları (Kısa açıklamanın üstünde) */}
                    <div className="d-none d-md-flex" style={{ gap: "10px", flexWrap: "wrap" }}>
                      {(product.model_3d_url || product.media?.model_3d_url) && (
                        <OverlayCtaButton
                          variant="primary"
                          onClick={() => setModel3dModalOpen(true)}
                          leftIcon={<Model3dIcon size={12} />}
                          className="static-cta"
                        >
                          3D GÖRÜNTÜLEME
                        </OverlayCtaButton>
                      )}
                      {product.video_url && (
                        <OverlayCtaButton
                          onClick={() => setYoutubeModalOpen(true)}
                          leftIcon={<PlayIcon size={14} />}
                          rightIcon={<ArrowIcon size={10} />}
                          className="static-cta"
                        >
                          ÜRÜN VİDEOSUNU İZLE
                        </OverlayCtaButton>
                      )}
                    </div>

                    {/* Kısa Açıklama - Desktopta her zaman, mobilde eğer detaylı açıklama yoksa göster */}
                    {(showShortDescription || !product.description) && product.short_description && (
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

                    {product?.name !== "katya Robot Süpürge" && (
                      <div className="tf-product-info-buy-button">
                        <form onSubmit={(e) => e.preventDefault()} className="">
                          <div className="tf-product-buy-actions d-none d-md-flex" style={{ alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div className="tf-product-info-quantity" style={{ margin: 0 }}>
                              <Quantity setQuantity={setQuantity} initialValue={quantity} minQuantity={minQuantity} maxQuantity={maxQuantity} disabled={buttonState.buttonDisabled} />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddToCartAnimated}
                              disabled={isAdding || showSuccess || buttonState.buttonDisabled}
                              className={`main-cart-btn ${showSuccess ? "success-animation" : ""} ${buttonState.buttonText === "Stokta Yok" ? "out-of-stock" : ""}`}
                            >
                              <span className="button-text-main">
                                {showSuccess
                                  ? "Sepete Eklendi"
                                  : isAdding
                                    ? "Ekleniyor..."
                                    : buttonState.buttonText}
                              </span>
                              {showSuccess && (
                                <span className="button-text-slide">
                                  Sepete Eklendi
                                </span>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    <VolumeDiscount product={product} setQuantity={setQuantity} />

                    <style jsx global>{`
                      @media (min-width: 768px) {
                        .tf-product-media-wrap {
                          position: sticky !important;
                          top: 100px !important;
                        }
                      }

                      .static-cta {
                        position: static !important;
                        transform: none !important;
                        width: auto !important;
                        padding-top: 9px !important;
                        padding-bottom: 9px !important;
                        padding-left: 19px !important;
                        padding-right: 19px !important;
                        font-size: 14px !important;
                      }
                      .static-cta .overlay-cta-btn__icon--left svg {
                        width: 16px !important;
                        height: 16px !important;
                      }
                      .static-cta .overlay-cta-btn__icon--right svg {
                        width: 12px !important;
                        height: 12px !important;
                      }

                      .product-status-content {
                        position: relative;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        overflow: hidden;
                        min-height: 24px;
                      }

                      .announcement-message {
                        font-size: 13px;
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

                      @media (max-width: 767px) {
                        .announcement-message {
                          font-size: 12px;
                        }
                      }

                      .announcement-message.active {
                        opacity: 1;
                        transform: translateY(0);
                        position: relative;
                        pointer-events: auto;
                      }

                      .announcement-message.active.animating-out {
                        opacity: 0;
                        transform: translateY(-100%);
                        position: absolute;
                      }

                      .announcement-message.next {
                        opacity: 1;
                        transform: translateY(0);
                        position: relative;
                        pointer-events: auto;
                      }

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

                      .tf-product-info-variant-picker .variant-picker-values input[type="radio"]:not(:checked) + .style-text:hover,
                      .tf-product-info-variant-picker .variant-picker-values a.style-text:hover {
                        background: #eee !important;
                        border-color: var(--primary, #3c81b5) !important;
                        color: #111 !important;
                      }

                      .tf-product-info-variant-picker .variant-picker-values input[type="radio"]:checked + .style-text {
                        background: var(--primary, #3c81b5) !important;
                        border-color: var(--primary, #3c81b5) !important;
                        color: #fff !important;
                        pointer-events: none;
                        cursor: default !important;
                      }

                      .tf-product-info-variant-picker .variant-picker-values input[type="radio"]:checked + .style-text p {
                        color: #fff !important;
                      }

                      .tf-product-buy-actions {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                      }

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
                        background: #10b981 !important;
                        border-color: #10b981 !important;
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
                        0% { transform: translateY(100%); opacity: 0; }
                        20% { transform: translateY(0); opacity: 1; }
                        80% { transform: translateY(0); opacity: 1; }
                        100% { transform: translateY(100%); opacity: 0; }
                      }
                    `}</style>
                    <div className="tf-product-info-extra-link">


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
                                              {typeof item.normal_price === "number"
                                                ? `${item.normal_price.toLocaleString("tr-TR")} TL`
                                                : `${item.normal_price} TL`}
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
      </section>

      {product?.name !== "Katya Akıllı Robot Süpürge" && (
        <SmartStickyBar
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          minQuantity={minQuantity}
          maxQuantity={maxQuantity}
          isStockLimit={isStockLimiting}
          soldOut={buttonState.buttonDisabled && buttonState.buttonText === "Stokta Yok"}
        />
      )}

      {/* Video Player - sadece influencer_videos varsa ve doluysa */}
      {Array.isArray(product?.influencer_videos) && product.influencer_videos.length > 0 && (
        <ProductVideoPlayer influencerVideos={product.influencer_videos} />
      )}
    </>
  );
}
