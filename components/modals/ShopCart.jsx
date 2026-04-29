"use client";
import React from "react";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import { log } from "@/utils/logger";
import BirlikteAlSepet from "@/components/common/BirlikteAlSepet";
import { getCartRecommendations } from "@/api/cart";
import Quantity from "@/components/shopDetails/Quantity";
import ClearCartButton from "@/components/common/ClearCartButton";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import SimartButton from "@/components/common/SimartButton";
import { calculateCartTotals } from "@/utils/cartTotals";
import ErrorToast from "@/components/common/ErrorToast";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

const translations = {
  tr: {
    myCart: "Sepetim",
    interestedTitle: "İlginizi çekebilir",
    loading: "Yükleniyor...",
    remove: "Kaldır",
    removing: "Kaldırılıyor...",
    specialGift: "Sepet Tutarına Özel Hediye",
    failedApply: "Uygulanamadı",
    errorUpdate: "Miktar güncellenirken bir hata oluştu.",
    systemError: "Sistemsel bir hata oluştu.",
    couponError: "Kupon kaldırılırken bir hata oluştu.",
    viewCart: "Sepeti Görüntüle",
    checkout: "Sipariş Ver",
    emptyCart: "Sepetinizde ürün bulunmamaktadır.",
    startShopping: "Alışverişe Başla",
    subtotal: "Ara Toplam",
    customDiscount: "Size Özel İndirim",
    specialDiscount: "Sepet Tutarına özel indirim",
    campaignDiscount: "Kampanya İndirimi",
    couponDiscount: "Kupon İndirimi",
    total: "Toplam",
    couponCodePlaceholder: "Kupon Kodu",
    apply: "Uygula",
    couponSuccess: "Kupon kodu başarıyla uygulandı!",
    productTipPrefix: "ürününden",
    currency: "TL",
    locale: "tr-TR"
  },
  en: {
    myCart: "My Cart",
    interestedTitle: "You might be interested in",
    loading: "Loading...",
    remove: "Remove",
    removing: "Removing...",
    specialGift: "Special Gift for Cart Total",
    failedApply: "Failed to apply",
    errorUpdate: "Error updating quantity.",
    systemError: "A system error occurred.",
    couponError: "Error removing coupon.",
    viewCart: "View Cart",
    checkout: "Checkout",
    emptyCart: "Your cart is empty.",
    startShopping: "Start Shopping",
    subtotal: "Subtotal",
    customDiscount: "Special Discount",
    specialDiscount: "Special discount for cart total",
    campaignDiscount: "Campaign Discount",
    couponDiscount: "Coupon Discount",
    total: "Total",
    couponCodePlaceholder: "Coupon Code",
    apply: "Apply",
    couponSuccess: "Coupon code applied successfully!",
    productTipPrefix: "from product",
    currency: "TL",
    locale: "en-US",
    invalidCoupon: "Invalid coupon code.",
    expiredCoupon: "Coupon has expired.",
    limitReachedCoupon: "Coupon usage limit has been reached.",
    minAmountNotMet: "Minimum cart amount for this coupon has not been met.",
    restrictedProductCoupon: "This coupon can only be applied to specific products. These products are not in your cart.",
    alreadyUsedCoupon: "This coupon code has already been used.",
    combineCampaignError: "This coupon cannot be combined with other campaigns or discounts."
  }
};

export default function ShopCart() {
  const { items, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const lang = useLangStore((state) => state.lang);
  const t = translations[lang] || translations.tr;

  // API'den gelen totals değerlerini ayrı selector'la al (infinite loop'u önlemek için)
  const totals = useCartStore((state) => state.totals);
  const applied_campaigns = useCartStore((state) => state.applied_campaigns);
  const coupon = useCartStore((state) => state.coupon);
  const cross_sale_campaigns = useCartStore((state) => state.cross_sale_campaigns);
  const hasCrossSale = Array.isArray(cross_sale_campaigns) && cross_sale_campaigns.length > 0;

  // Totals hesaplamasını useMemo ile memoize et
  const cartTotals = useMemo(() => {
    return calculateCartTotals(totals, items);
  }, [totals, items]);

  // Hangi ürünün hangi action'da loading olduğunu takip et: { itemId: 'increase' | 'decrease' | 'remove' | null }
  const [loadingActions, setLoadingActions] = useState({});
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [maxQuantityForToast, setMaxQuantityForToast] = useState(null);
  const [isStockLimitForToast, setIsStockLimitForToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  // Items değiştiğinde, artık sepette olmayan ürünlerin loading state'ini temizle
  useEffect(() => {
    const currentItemIds = new Set(items.map((item) => String(item.id)));
    setLoadingActions((prev) => {
      const cleaned = {};
      Object.keys(prev).forEach((itemId) => {
        if (currentItemIds.has(String(itemId))) {
          cleaned[itemId] = prev[itemId];
        }
      });
      return cleaned;
    });
  }, [items]);

  // Önerileri modal açıldığında çekmek için
  const fetchRecommendations = React.useCallback(() => {
    if (items.length === 0) {
      // Eğer veri zaten varsa tekrar çekme (opsiyonel, taze veri isteniyorsa kaldırılabilir)
      // Kullanıcı performansı önemsediği için cache mantığı iyi olur.
      if (recommendations.length > 0) return;

      getCartRecommendations()
        .then((recs) => {
          if (recs && recs.length > 0) {
            setRecommendations(recs.slice(0, 10));
          }
        })
        .catch((error) => {
          console.error("Öneriler yüklenirken hata:", error);
        });
    }
  }, [items.length, recommendations.length]);

  // Event listener: Modal açıldığında çek
  useEffect(() => {
    const modalElement = document.getElementById("shoppingCart");
    if (!modalElement) return;

    const handleShown = () => {
      fetchRecommendations();
    };

    modalElement.addEventListener("shown.bs.modal", handleShown);
    return () => {
      modalElement.removeEventListener("shown.bs.modal", handleShown);
    };
  }, [fetchRecommendations]);

  // Sepet açıkken ürün silinip sepet boşalırsa çek
  useEffect(() => {
    const modalElement = document.getElementById("shoppingCart");
    if (items.length === 0 && modalElement && modalElement.classList.contains("show")) {
      fetchRecommendations();
    } else if (items.length > 0) {
      // Sepet dolduysa önerileri temizle (isteğe bağlı, UI kalabalık olmasın diye)
      setRecommendations([]);
    }
  }, [items.length, fetchRecommendations]);

  const getLocalizedErrorMessage = (msg) => {
    if (!msg || typeof msg !== "string" || !isEn) return msg;

    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("belirli ürünlere uygulanabilir") || lowerMsg.includes("sepetinizde bu ürünler bulunmuyor")) {
      return t.restrictedProductCoupon;
    }
    if (lowerMsg.includes("geçersiz") || lowerMsg.includes("bulunamadı")) {
      return t.invalidCoupon;
    }
    if (lowerMsg.includes("süresi dolmuş") || lowerMsg.includes("geçmiş")) {
      return t.expiredCoupon;
    }
    if (lowerMsg.includes("limit") || lowerMsg.includes("kullanım sınırı")) {
      return t.limitReachedCoupon;
    }
    if (lowerMsg.includes("minimum sepet tutarı") || lowerMsg.includes("alt limit")) {
      return t.minAmountNotMet;
    }
    if (lowerMsg.includes("daha önce kullanılmış") || lowerMsg.includes("zaten kullanılmış")) {
      return t.alreadyUsedCoupon;
    }
    if (lowerMsg.includes("birleştirilemez") || lowerMsg.includes("başka kampanya")) {
      return t.combineCampaignError;
    }

    return msg;
  };

  const setQuantity = async (id, quantity, action) => {
    // Minimum 1 kontrolü - 1'den küçük olamaz
    if (quantity < 1 || loadingActions[id]) return;

    setLoadingActions((prev) => ({ ...prev, [id]: action }));
    try {
      const result = await updateQuantity(id, quantity);
      if (result && result.error) {
        setErrorToastMessage(getLocalizedErrorMessage(result.message) || t.errorUpdate);
        setShowErrorToast(true);
      }
    } catch (error) {
      console.error("Miktar güncelleme hatası:", error);
      setErrorToastMessage(getLocalizedErrorMessage(error?.message) || t.systemError);
      setShowErrorToast(true);
    } finally {
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleRemoveItem = async (id) => {
    if (loadingActions[id]) return;
    setLoadingActions((prev) => ({ ...prev, [id]: "remove" }));
    try {
      await removeItem(id);
    } catch (error) {
      console.error("Sepetten çıkarma hatası:", error);
      setLoadingActions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim() || isApplyingCoupon || coupon) return;

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess(false);

    try {
      const result = await applyCoupon(couponCode.trim());
      const success = result === true || (result && result.success);
      if (success) {
        setCouponSuccess(true);
        setCouponCode("");
        setTimeout(() => setCouponSuccess(false), 3000);
      } else {
        setCouponError(getLocalizedErrorMessage((result && result.message) || t.failedApply));
        setTimeout(() => setCouponError(""), 4000);
      }
    } catch (error) {
      if (error.response) {
        const msg = error.response?.data?.message;
        setCouponError(getLocalizedErrorMessage(msg && String(msg).trim() ? msg : t.failedApply));
      } else {
        setCouponError(t.failedApply);
      }
      setTimeout(() => setCouponError(""), 4000);
      log("Kupon uygulama hatası:", error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!coupon || isRemovingCoupon) return;

    setIsRemovingCoupon(true);
    setCouponError("");

    try {
      const success = await removeCoupon(coupon.code);
      if (!success) {
        setCouponError(getLocalizedErrorMessage(t.couponError));
        setTimeout(() => setCouponError(""), 4000);
      }
    } catch (error) {
      setCouponError(getLocalizedErrorMessage(t.couponError));
      setTimeout(() => setCouponError(""), 4000);
      log("Kupon kaldırma hatası:", error);
    } finally {
      setIsRemovingCoupon(false);
    }
  };

  return (
    <>
      <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantityForToast} isStockLimit={isStockLimitForToast} />
      <ErrorToast visible={showErrorToast} onHide={() => setShowErrorToast(false)} message={errorToastMessage} />
      <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="header">
              <div className="title fw-5">
                {t.myCart}
                <ClearCartButton variant="inline" />
              </div>
              <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
            </div>
            <div className="wrap">
              {/* Sepette ürün yoksa API'den önerileri göster */}
              {items.length === 0 && recommendations.length > 0 && (
                <div className="tf-mini-cart-item">
                  <BirlikteAlSepet title={t.interestedTitle} products={recommendations} />
                </div>
              )}

              <div className="tf-mini-cart-wrap">
                <div className="tf-mini-cart-main">
                  <div className="tf-mini-cart-sroll">
                    <div className="tf-mini-cart-items">
                      {hasCrossSale && (
                        <div className="tf-mini-cart-item ">
                          <BirlikteAlSepet />
                        </div>
                      )}

                      {hasCrossSale && (
                        <div className="tf-mini-cart-item ">
                          <BirlikteAlSepet />
                        </div>
                      )}
                      {(() => {
                        // Normal ürünleri ve gift ürünleri ayır
                        const normalItems = items.filter((item) => !item.is_gift);
                        const giftItems = items.filter((item) => item.is_gift);

                        const giftCampaignById = new Map();
                        const resolveGiftCampaign = (giftItem) => {
                          if (!applied_campaigns || applied_campaigns.length === 0) return null;
                          const key = giftItem.id || giftItem.productId || giftItem.product?.id;
                          if (giftCampaignById.has(key)) return giftCampaignById.get(key);
                          const giftProductId = giftItem.productId || giftItem.product?.id;
                          const found =
                            applied_campaigns.find((campaign) => {
                              const isApplied = giftItem.applied_campaign_ids?.includes(campaign.id);
                              const isGiftMatch = campaign.gift_items?.some(
                                (gift) => gift.product_id === giftProductId,
                              );
                              return isApplied || isGiftMatch;
                            }) || null;
                          giftCampaignById.set(key, found);
                          return found;
                        };

                        const tierGifts = giftItems.filter(
                          (giftItem) => resolveGiftCampaign(giftItem)?.applied_tier?.min_cart_amount,
                        );
                        const nonTierGifts = giftItems.filter(
                          (giftItem) => !resolveGiftCampaign(giftItem)?.applied_tier?.min_cart_amount,
                        );

                        // Gift ürünleri, source_product_ids'e göre normal ürünlerin altına yerleştir
                        const linkedGiftIds = new Set();
                        const groupedItems = normalItems.map((normalItem) => {
                          const relatedGifts = nonTierGifts.filter((giftItem) => {
                            const hasLink =
                              Array.isArray(giftItem.source_product_ids) &&
                              giftItem.source_product_ids.includes(normalItem.productId);
                            if (hasLink && !linkedGiftIds.has(giftItem.id)) {
                              linkedGiftIds.add(giftItem.id);
                              return true;
                            }
                            return false;
                          });
                          return { normalItem, giftItems: relatedGifts };
                        });
                        const unlinkedGifts = nonTierGifts.filter((giftItem) => !linkedGiftIds.has(giftItem.id));

                        // Sepet bazlı kampanyaları bul ve hangi ürünle ilişkili olduğunu belirle
                        const cartBasedCampaigns =
                          applied_campaigns && applied_campaigns.length > 0
                            ? (() => {
                              const productBasedCampaignIds = new Set();
                              items.forEach((item) => {
                                if (item.applied_campaign_ids && Array.isArray(item.applied_campaign_ids)) {
                                  item.applied_campaign_ids.forEach((id) => productBasedCampaignIds.add(id));
                                }
                              });

                              return applied_campaigns.filter((campaign) => {
                                const isProductBasedType =
                                  campaign.type === "x_urun_y_tl" || campaign.type === "x_alana_y_hediye";
                                const isNotInAnyProduct = !productBasedCampaignIds.has(campaign.id);
                                const hasNextTier = campaign.next_tier?.message;
                                return !isProductBasedType && (isNotInAnyProduct || hasNextTier);
                              });
                            })()
                            : [];

                        // Kampanya mesajından ürün adını bul ve sepetteki ürünle eşleştir
                        const findTargetProductForCampaign = (campaign) => {
                          if (!campaign.name) return null;
                          // Mesaj formatı: "Kare Cam Temizleme alana katya U 30000 TL Kampanyası"
                          // "alana" kelimesinden sonraki kısmı al (ürün adı)
                          const match = campaign.name.match(/alana\s+([^0-9]+?)(?:\s+\d+|\s+Kampanyası|$)/i);
                          if (match && match[1]) {
                            const productNameInMessage = match[1].trim();
                            // Sepetteki ürünlerden bu adı içeren ürünü bul
                            return normalItems.find((item) => {
                              const itemName = (item.name || "").toLowerCase();
                              const searchName = productNameInMessage.toLowerCase();
                              return itemName.includes(searchName) || searchName.includes(itemName);
                            });
                          }
                          return null;
                        };

                        // Her ürün için ilgili kampanya mesajlarını bul
                        const getCampaignMessagesForProduct = (productItem) => {
                          const messages = [];

                          // 1. Sepet bazlı kampanyalar (mesajından ürün adını parse ederek)
                          cartBasedCampaigns
                            .filter((campaign) => {
                              const targetProduct = findTargetProductForCampaign(campaign);
                              return targetProduct && targetProduct.id === productItem.id;
                            })
                            .forEach((campaign) => {
                              messages.push({
                                campaign,
                                message: campaign.next_tier?.message || `${campaign.name} `,
                                isNextTier: !!campaign.next_tier?.message,
                              });
                            });

                          // 2. Ürün bazlı kampanyalar (x_al_y_ode gibi - applied_campaign_ids'den)
                          if (
                            productItem.applied_campaign_ids &&
                            Array.isArray(productItem.applied_campaign_ids) &&
                            applied_campaigns
                          ) {
                            productItem.applied_campaign_ids.forEach((campaignId) => {
                              const campaign = applied_campaigns.find((c) => c.id === campaignId);
                              if (campaign && campaign.type === "x_al_y_ode") {
                                // Bu kampanya zaten mesajlarda yoksa ekle
                                if (!messages.some((m) => m.campaign.id === campaign.id)) {
                                  messages.push({
                                    campaign,
                                    message: `${campaign.name} `,
                                    isNextTier: false,
                                  });
                                }
                              }
                            });
                          }

                          return messages;
                        };

                        return (
                          <>
                            {groupedItems.map(({ normalItem, giftItems: relatedGifts }, groupIndex) => {
                              const isLastGroup = groupIndex === groupedItems.length - 1;
                              const isReallyLast = isLastGroup && unlinkedGifts.length === 0 && tierGifts.length === 0;

                              return (
                                <React.Fragment key={normalItem.id || groupIndex}>
                                  {/* Normal Ürün */}
                                  {(() => {
                                    const item = normalItem;
                                    const categorySlug =
                                      item.product?.category_slug ||
                                      item.product?.categories?.[0]?.slug ||
                                      item.product?.item_category?.slug ||
                                      "urunler";
                                    const productSlug = item.product?.slug || item.slug || item.id;
                                    const productUrl = getLocalizedUrl(`/magaza/${categorySlug}/${productSlug}`, lang);
                                    const imageUrl =
                                      item.image ||
                                      item.product?.cover_image?.url ||
                                      item.product?.images?.[0] ||
                                      "/images/placeholder.jpg";
                                    const isLoading = loadingActions[item.id];
                                    const isLoadingDecrease = isLoading === "decrease";
                                    const isLoadingIncrease = isLoading === "increase";
                                    const isAnyLoading = !!isLoading;
                                    const purchaseLimit =
                                      item.max_purchase_quantity ??
                                      item.product?.max_purchase_quantity ??
                                      item.product?.max_quantity ??
                                      null;
                                    const parsedPurchaseLimit = purchaseLimit === null || purchaseLimit === undefined ? null : Number(purchaseLimit);

                                    const stockLimit = (!item.product?.unlimited_stock && item.product?.stock_quantity != null)
                                      ? Number(item.product.stock_quantity)
                                      : null;

                                    let maxQty = parsedPurchaseLimit === 0 ? null : (parsedPurchaseLimit != null ? Number(parsedPurchaseLimit) : null);
                                    if (!item.product?.is_pre_order && stockLimit !== null) {
                                      if (maxQty === null) maxQty = stockLimit;
                                      else maxQty = Math.min(maxQty, stockLimit);
                                    }

                                    const isStockLimiting = !item.product?.is_pre_order && stockLimit !== null && (parsedPurchaseLimit === null || parsedPurchaseLimit === 0 || stockLimit <= parsedPurchaseLimit);

                                    const minQty =
                                      item.min_purchase_quantity ?? item.product?.min_purchase_quantity ?? 1;
                                    // Bu ürün için kampanya mesajlarını al
                                    const itemCampaignMessages = getCampaignMessagesForProduct(item);

                                    const discountAmount = item.discount_amount ?? item.discountAmount ?? null;
                                    const discountPrice = item.discount_price ?? item.discountPrice ?? null;
                                    const regularPrice = item.price ?? item.product?.price ?? null;

                                    let displayRegularPrice = null;
                                    let displayDiscountPrice = null;

                                    if (discountAmount != null && discountPrice != null && discountAmount < discountPrice) {
                                      displayRegularPrice = discountPrice;
                                      displayDiscountPrice = discountAmount;
                                    } else if (discountAmount != null && regularPrice != null) {
                                      displayRegularPrice = regularPrice;
                                      displayDiscountPrice = discountAmount;
                                    } else if (regularPrice != null) {
                                      displayRegularPrice = regularPrice;
                                    } else if (discountPrice != null) {
                                      displayRegularPrice = discountPrice;
                                    } else if (discountAmount != null) {
                                      displayRegularPrice = discountAmount;
                                    }

                                    return (
                                      <div
                                        key={item.id}
                                        className={`tf-mini-cart-item ${isAnyLoading ? "disabled-item" : ""} ${relatedGifts.length > 0 ? "tf-mini-cart-item-no-border" : ""}`}
                                      >
                                        <div className="tf-mini-cart-image">
                                          <Link href={productUrl}>
                                            <Image
                                              alt={item.name}
                                              src={imageUrl}
                                              width={668}
                                              height={932}
                                              style={{ objectFit: "cover" }}
                                            />
                                          </Link>
                                        </div>
                                        <div className="tf-mini-cart-info">
                                          <Link className="title link" href={productUrl}>
                                            {item.name}
                                          </Link>
                                          <div className="price fw-6">
                                            {displayDiscountPrice != null &&
                                              displayRegularPrice != null &&
                                              displayDiscountPrice < displayRegularPrice ? (
                                              <>
                                                <span
                                                  style={{ color: "#3c81b5", fontWeight: "600", marginRight: "8px" }}
                                                >
                                                  {displayDiscountPrice.toLocaleString(t.locale)} {t.currency}
                                                </span>
                                                <span
                                                  style={{
                                                    textDecoration: "line-through",
                                                    color: "#999",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  {displayRegularPrice.toLocaleString(t.locale)} {t.currency}
                                                </span>
                                              </>
                                            ) : (
                                              <span style={{ color: "var(--primary, #3c81b5)" }}>
                                                {(displayRegularPrice ?? 0).toLocaleString(t.locale)} {t.currency}
                                              </span>
                                            )}
                                          </div>
                                          <div className="tf-mini-cart-btns">
                                            <div
                                              className={`wg-quantity small ${isAnyLoading ? "disabled" : ""}`}
                                              style={{ pointerEvents: isAnyLoading ? "none" : "auto" }}
                                            >
                                              <Quantity
                                                isLoading={isAnyLoading}
                                                setQuantity={(qty) => {
                                                  if (isAnyLoading) return;
                                                  const clamped =
                                                    maxQty != null && maxQty > 0
                                                      ? Math.min(Math.max(Number(qty) || 0, minQty), maxQty)
                                                      : Math.max(Number(qty) || 0, minQty);
                                                  if (clamped >= minQty) setQuantity(item.id, clamped, "change");
                                                }}
                                                minQuantity={minQty}
                                                maxQuantity={maxQty}
                                                initialValue={item.quantity}
                                                onMaxQuantityReached={() => {
                                                  setMaxQuantityForToast(maxQty);
                                                  setIsStockLimitForToast(isStockLimiting);
                                                  setShowMaxReachedToast(true);
                                                }}
                                                lang={lang}
                                              />
                                            </div>
                                            <div
                                              className="tf-mini-cart-remove"
                                              style={{
                                                cursor: isAnyLoading ? "not-allowed" : "pointer",
                                                opacity: isAnyLoading ? 0.5 : 1,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                              }}
                                              onClick={() => {
                                                if (!isAnyLoading) {
                                                  handleRemoveItem(item.id);
                                                }
                                              }}
                                            >
                                              {loadingActions[item.id] === "remove" ? (
                                                <div
                                                  className="spinner-border spinner-border-sm"
                                                  role="status"
                                                  style={{
                                                    width: "10px",
                                                    height: "10px",
                                                    borderWidth: "1.5px",
                                                    borderColor: "#3c81b5",
                                                    borderRightColor: "transparent",
                                                  }}
                                                >
                                                  <span className="visually-hidden">{t.loading}</span>
                                                </div>
                                              ) : (
                                                <svg
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-label="Kaldır"
                                                  role="img"
                                                >
                                                  <polyline points="3 6 5 6 21 6" />
                                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                  <path d="M10 11v6" />
                                                  <path d="M14 11v6" />
                                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                </svg>
                                              )}
                                            </div>
                                          </div>
                                          {/* Ürün bazlı kampanya mesajları */}
                                          {itemCampaignMessages.length > 0 && (
                                            <div style={{ marginTop: "8px" }}>
                                              {itemCampaignMessages.map(({ campaign, message, isNextTier }, idx) => (
                                                <div
                                                  key={`product-campaign-${campaign.id || idx}`}
                                                  className="tf-cart-campaign-badge"
                                                  style={{
                                                    fontSize: "11px",
                                                    color: isNextTier ? "#dc3545" : "#3c81b5",
                                                    marginTop: "4px",
                                                    lineHeight: "1.4",
                                                  }}
                                                >
                                                  {message}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Gift Ürünleri */}
                                  {relatedGifts.map((giftItem, giftIndex) => {
                                    const categorySlug =
                                      giftItem.product?.category_slug ||
                                      giftItem.product?.categories?.[0]?.slug ||
                                      giftItem.product?.item_category?.slug ||
                                      "urunler";
                                    const productSlug = giftItem.product?.slug || giftItem.slug || giftItem.id;
                                    const productUrl = getLocalizedUrl(`/magaza/${categorySlug}/${productSlug}`, lang);
                                    const imageUrl =
                                      giftItem.image ||
                                      giftItem.product?.cover_image?.url ||
                                      giftItem.product?.images?.[0] ||
                                      "/images/placeholder.jpg";
                                    const giftCampaign = resolveGiftCampaign(giftItem);
                                    const giftSourceNames =
                                      giftItem.applied_campaign_ids && applied_campaigns
                                        ? giftItem.applied_campaign_ids
                                          .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                                          .filter(Boolean)
                                        : [];
                                    const isLastGift = giftIndex === relatedGifts.length - 1;
                                    const shouldRemoveBorder = isReallyLast && isLastGift;

                                    return (
                                      <div
                                        key={`gift-${giftItem.id}-${giftIndex}`}
                                        className="tf-mini-cart-item tf-mini-cart-gift-item"
                                        style={{
                                          paddingLeft: "10px",
                                          backgroundColor: "#f5f5f5",
                                          borderRadius: "12px",
                                          borderBottom: shouldRemoveBorder ? "none" : undefined,
                                          marginBottom: shouldRemoveBorder ? "0" : undefined,
                                        }}
                                      >
                                        <div className="tf-mini-cart-image tf-mini-cart-gift-icon">
                                          <Link
                                            href={productUrl}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: "100%",
                                              height: "100%",
                                            }}
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                              aria-hidden="true"
                                              style={{ width: "36px", height: "36px" }}
                                            >
                                              <path
                                                d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                                                stroke="var(--primary, #3c81b5)"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          </Link>
                                        </div>
                                        <div className="tf-mini-cart-info">
                                          <Link className="title link" href={productUrl} style={{ fontSize: "13px" }}>
                                            {giftItem.name} x{giftItem.quantity}
                                          </Link>
                                          {giftSourceNames.length > 0 ? (
                                            <div
                                              className="tf-cart-campaign-badge"
                                              style={{ fontSize: "11px", color: "#3c81b5", marginTop: "4px" }}
                                            >
                                              {giftSourceNames.join(", ")}
                                            </div>
                                          ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                            <div
                                              className="tf-cart-campaign-badge"
                                              style={{ fontSize: "11px", color: "#3c81b5", marginTop: "4px" }}
                                            >
                                              {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString(
                                                t.locale,
                                              )}{" "}
                                              {t.specialGift}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {/* Hediye grubu ile sonraki ürün arasına ayırıcı */}
                                  {relatedGifts.length > 0 && !isReallyLast && (
                                    <div className="tf-cart-gift-separator" aria-hidden="true" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                            {unlinkedGifts.map((giftItem, giftIndex) => {
                              const categorySlug =
                                giftItem.product?.category_slug ||
                                giftItem.product?.categories?.[0]?.slug ||
                                giftItem.product?.item_category?.slug ||
                                "urunler";
                              const productSlug = giftItem.product?.slug || giftItem.slug || giftItem.id;
                              const productUrl = getLocalizedUrl(`/magaza/${categorySlug}/${productSlug}`, lang);
                              const imageUrl =
                                giftItem.image ||
                                giftItem.product?.cover_image?.url ||
                                giftItem.product?.images?.[0] ||
                                "/images/placeholder.jpg";
                              const giftCampaign = resolveGiftCampaign(giftItem);
                              const giftSourceNames =
                                giftItem.applied_campaign_ids && applied_campaigns
                                  ? giftItem.applied_campaign_ids
                                    .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                                    .filter(Boolean)
                                  : [];
                              return (
                                <div
                                  key={`gift-unlinked-${giftItem.id}-${giftIndex}`}
                                  className="tf-mini-cart-item tf-mini-cart-gift-item"
                                  style={{
                                    paddingLeft: "10px",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                >
                                  <div className="tf-mini-cart-image tf-mini-cart-gift-icon">
                                    <Link
                                      href={productUrl}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                        height: "100%",
                                      }}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        style={{ width: "36px", height: "36px" }}
                                      >
                                        <path
                                          d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                                          stroke="var(--primary, #3c81b5)"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                  <div className="tf-mini-cart-info">
                                    <Link className="title link" href={productUrl} style={{ fontSize: "13px" }}>
                                      {giftItem.name} x{giftItem.quantity}
                                    </Link>
                                    {giftSourceNames.length > 0 ? (
                                      <div
                                        className="tf-cart-campaign-badge"
                                        style={{ fontSize: "11px", color: "#3c81b5", marginTop: "4px" }}
                                      >
                                        {giftSourceNames.join(", ")}
                                      </div>
                                    ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                      <div
                                        className="tf-cart-campaign-badge"
                                        style={{ fontSize: "11px", color: "#3c81b5", marginTop: "4px" }}
                                      >
                                        {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString(t.locale)}{" "}
                                        {t.specialDiscount}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                            {unlinkedGifts.length > 0 && <div className="tf-cart-gift-separator" aria-hidden="true" />}
                            {tierGifts.map((giftItem, giftIndex) => {
                              const categorySlug =
                                giftItem.product?.category_slug ||
                                giftItem.product?.categories?.[0]?.slug ||
                                giftItem.product?.item_category?.slug ||
                                "urunler";
                              const productSlug = giftItem.product?.slug || giftItem.slug || giftItem.id;
                              const productUrl = getLocalizedUrl(`/magaza/${categorySlug}/${productSlug}`, lang);
                              const imageUrl =
                                giftItem.image ||
                                giftItem.product?.cover_image?.url ||
                                giftItem.product?.images?.[0] ||
                                "/images/placeholder.jpg";
                              const giftCampaign = resolveGiftCampaign(giftItem);
                              const giftSourceNames =
                                giftItem.applied_campaign_ids && applied_campaigns
                                  ? giftItem.applied_campaign_ids
                                    .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                                    .filter(Boolean)
                                  : [];
                              return (
                                <div
                                  key={`gift-tier-${giftItem.id}-${giftIndex}`}
                                  className="tf-mini-cart-item tf-mini-cart-gift-item"
                                  style={{
                                    paddingLeft: "10px",
                                    borderLeft: "3px solid #3c81b5",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                >
                                  <div className="tf-mini-cart-image tf-mini-cart-gift-icon">
                                    <Link
                                      href={productUrl}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                        height: "100%",
                                      }}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                        style={{ width: "36px", height: "36px" }}
                                      >
                                        <path
                                          d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                                          stroke="var(--primary, #3c81b5)"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                  <div className="tf-mini-cart-info">
                                    <Link className="title link" href={productUrl} style={{ fontSize: "13px" }}>
                                      {giftItem.name} x{giftItem.quantity}
                                    </Link>
                                    {giftSourceNames.length > 0 ? (
                                      <div
                                        className="tf-cart-campaign-badge"
                                        style={{ fontSize: "11px", color: "#3c81b5", marginTop: "4px" }}
                                      >
                                        {giftSourceNames.join(", ")}
                                      </div>
                                    ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                      <div
                                        className="tf-cart-campaign-badge"
                                        style={{ fontSize: "11px", color: "#3c81b5", marginTop: "4px" }}
                                      >
                                        {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString(t.locale)}{" "}
                                        {t.specialGift}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                            {tierGifts.length > 0 && <div className="tf-cart-gift-separator" aria-hidden="true" />}
                          </>
                        );
                      })()}

                      {!items.length && (
                        <div className="container">
                          <div className="row align-items-center mt-5 mb-4">
                            <div className="col-12 fs-18 text-center mb-3">{t.emptyCart}</div>
                            <div className="col-12 text-center">
                              <SimartButton
                                href={getLocalizedUrl("/magaza", lang)}
                                variant="fill"
                                style={{ width: "fit-content" }}
                              >
                                {t.startShopping}
                              </SimartButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="tf-mini-cart-bottom">
                    <div className="tf-mini-cart-tool"></div>
                    <div
                      className="tf-mini-cart-bottom-wrap"
                      style={{ backgroundColor: "#f5f5f5", boxShadow: "1px 1px 1px 1px black" }}
                    >
                      <div className="tf-cart-totals-discounts">
                        {/* Ara Toplam - Sadece indirim varsa göster */}
                        {cartTotals.subtotal > 0 && cartTotals.hasAnyDiscount && (
                          <div className="tf-cart-totals-item" style={{ borderTop: "none", borderBottom: "none" }}>
                            <div className="tf-cart-total-label fw-6" style={{ fontSize: "14px" }}>
                              {t.subtotal}
                            </div>
                            <div className="tf-cart-total-value fw-6" style={{ fontSize: "14px" }}>
                              {cartTotals.subtotal.toLocaleString(t.locale)} {t.currency}
                            </div>
                          </div>
                        )}

                        {/* İndirimler Section - Sadece indirim varsa göster */}
                        {(cartTotals.customDiscountAmount > 0 ||
                          cartTotals.campaignDiscountAmount > 0 ||
                          cartTotals.couponDiscountAmount > 0) && (
                            <div>
                              {cartTotals.customDiscountAmount > 0 && (
                                <div className="tf-cart-totals-item" style={{ borderTop: "none", borderBottom: "none" }}>
                                  <div className="tf-cart-total-label fw-6" style={{ fontSize: "14px" }}>
                                    {t.customDiscount}
                                  </div>
                                  <div
                                    className="tf-cart-total-value fw-6"
                                    style={{ fontSize: "14px", color: "#3c81b5" }}
                                  >
                                    - {cartTotals.customDiscountAmount.toLocaleString(t.locale)} {t.currency}
                                  </div>
                                </div>
                              )}
                              {/* Kampanya İndirimi */}
                              {cartTotals.campaignDiscountAmount > 0 && (
                                <div className="tf-cart-totals-item" style={{ borderTop: "none", borderBottom: "none" }}>
                                  <div className="tf-cart-total-label fw-6" style={{ fontSize: "14px" }}>
                                    {t.campaignDiscount}
                                  </div>
                                  <div
                                    className="tf-cart-total-value fw-6"
                                    style={{ fontSize: "14px", color: "#3c81b5" }}
                                  >
                                    - {cartTotals.campaignDiscountAmount.toLocaleString(t.locale)} {t.currency}
                                  </div>
                                </div>
                              )}
                              {/* Kupon İndirimi */}
                              {cartTotals.couponDiscountAmount > 0 && coupon && coupon.code && (
                                <div className="tf-cart-totals-item" style={{ borderTop: "none", borderBottom: "none" }}>
                                  <div
                                    className="tf-cart-total-label fw-6"
                                    style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
                                  >
                                    <span>{t.couponDiscount}:</span>
                                    {coupon.code && (
                                      <span style={{ fontWeight: "600", color: "#333" }}>{coupon.code}</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={handleRemoveCoupon}
                                      disabled={isRemovingCoupon}
                                      style={{
                                        fontSize: "12px",
                                        color: "#dc3545",
                                        background: "none",
                                        border: "none",
                                        cursor: isRemovingCoupon ? "not-allowed" : "pointer",
                                        padding: "2px 4px",
                                        opacity: isRemovingCoupon ? 0.5 : 1,
                                        textDecoration: "underline",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {isRemovingCoupon ? t.removing : t.remove}
                                    </button>
                                  </div>
                                  <div
                                    className="tf-cart-total-value fw-6"
                                    style={{ fontSize: "14px", color: "#3c81b5" }}
                                  >
                                    - {cartTotals.couponDiscountAmount.toLocaleString(t.locale)} {t.currency}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        <div className="tf-cart-totals-item tf-cart-totals-item-total">
                          <div className="tf-cart-total-label fw-6" style={{ fontSize: "18px" }}>
                            {t.total}
                          </div>
                          <div className="tf-cart-total-value fw-6" style={{ fontSize: "18px" }}>
                            {cartTotals.total.toLocaleString(t.locale)} {t.currency}
                          </div>
                        </div>
                        {/* Sepet bazlı kampanya mesajları - Sadece ürünle eşleşmeyenler için (fallback) */}
                        {applied_campaigns &&
                          applied_campaigns.length > 0 &&
                          (() => {
                            const normalItems = items.filter((item) => !item.is_gift);
                            // Tüm ürün bazlı kampanya ID'lerini topla
                            const productBasedCampaignIds = new Set();
                            items.forEach((item) => {
                              if (item.applied_campaign_ids && Array.isArray(item.applied_campaign_ids)) {
                                item.applied_campaign_ids.forEach((id) => productBasedCampaignIds.add(id));
                              }
                            });

                            // Sepet bazlı kampanyaları filtrele (ürün bazlı olmayanlar)
                            const cartBasedCampaigns = applied_campaigns.filter((campaign) => {
                              const isProductBasedType =
                                campaign.type === "x_urun_y_tl" || campaign.type === "x_alana_y_hediye";
                              const isNotInAnyProduct = !productBasedCampaignIds.has(campaign.id);
                              const hasNextTier = campaign.next_tier?.message;
                              return !isProductBasedType && (isNotInAnyProduct || hasNextTier);
                            });

                            // Ürünle eşleşmeyen kampanyaları bul (fallback - ürün yanında gösterilemeyenler)
                            const unmatchedCampaigns = cartBasedCampaigns.filter((campaign) => {
                              const match = campaign.name?.match(/alana\s+([^0-9]+?)(?:\s+\d+|\s+Kampanyası|$)/i);
                              if (match && match[1]) {
                                const productNameInMessage = match[1].trim().toLowerCase();
                                return !normalItems.some((item) => {
                                  const itemName = (item.name || "").toLowerCase();
                                  return (
                                    itemName.includes(productNameInMessage) || productNameInMessage.includes(itemName)
                                  );
                                });
                              }
                              return true; // Parse edilemeyen kampanyalar fallback'e gider
                            });

                            if (unmatchedCampaigns.length === 0) return null;

                            return (
                              <div style={{ marginTop: "8px" }}>
                                {unmatchedCampaigns.map((campaign, idx) => {
                                  if (campaign.next_tier?.message) {
                                    return (
                                      <div
                                        key={`next-tier-${campaign.id || idx}`}
                                        style={{
                                          color: "#dc3545",
                                          fontSize: "11px",
                                          lineHeight: "1.4",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        {campaign.next_tier.message}
                                      </div>
                                    );
                                  }
                                  return (
                                    <div
                                      key={`cart-campaign-${campaign.id || idx}`}
                                      style={{
                                        color: "#3c81b5",
                                        fontSize: "11px",
                                        lineHeight: "1.4",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      {campaign.name}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                      </div>

                      {/* Kupon Kodu - Sadece kupon yoksa göster */}
                      {(!coupon || !coupon.code) && (
                        <div className="coupon-box" style={{ marginTop: "15px", marginBottom: "12px" }}>
                          <form onSubmit={handleApplyCoupon} style={{ position: "relative", display: "block" }}>
                            <input
                              type="text"
                              placeholder={t.couponCodePlaceholder}
                              value={couponCode}
                              onChange={(e) => {
                                // Boşlukları temizle ve tek kelime olarak al
                                const value = e.target.value.replace(/\s/g, "").toUpperCase();
                                setCouponCode(value);
                                setCouponError("");
                                setCouponSuccess(false);
                              }}
                              style={{
                                width: "100%",
                                padding: "0 80px 0 15px", // Sağdan pay bırak
                                border: couponError ? "1px solid #dc3545" : couponSuccess ? "1px solid #3c81b5" : "1px solid #e5e5e5",
                                borderRadius: "12px",
                                fontSize: "16px",
                                height: "42px",
                              }}
                              disabled={isApplyingCoupon}
                            />
                            <button
                              type="submit"
                              className="tf-btn btn-sm btn-fill animate-hover-btn"
                              disabled={isApplyingCoupon || !couponCode.trim()}
                              style={{
                                position: "absolute",
                                right: "5px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: "32px",
                                padding: "0 15px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                opacity: isApplyingCoupon || !couponCode.trim() ? 0.6 : 1,
                                cursor: isApplyingCoupon || !couponCode.trim() ? "not-allowed" : "pointer",
                                lineHeight: "32px",
                                border: "none",
                              }}
                            >
                              {isApplyingCoupon ? "..." : t.apply}
                            </button>
                          </form>
                          {couponError && (
                            <div style={{ marginTop: "8px", fontSize: "12px", color: "#dc3545" }}>{couponError}</div>
                          )}
                          {couponSuccess && (
                            <div style={{ marginTop: "8px", fontSize: "12px", color: "#3c81b5" }}>
                              {t.couponSuccess}
                            </div>
                          )}
                        </div>
                      )}

                      {totals?.cart_tips && Array.isArray(totals.cart_tips) && totals.cart_tips.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                          {totals.cart_tips.map((tip, idx) => (
                            <div
                              key={idx}
                              style={{
                                marginBottom: "8px",
                                fontSize: "13px",
                                color: "#3c81b5",
                                lineHeight: "1.5",
                              }}
                            >
                              {tip.product_name ? (
                                <>
                                  <span style={{ fontWeight: "700" }}>
                                    {tip.product_name}
                                  </span>{" "}
                                  {t.productTipPrefix} {tip.message_short || tip.message}
                                </>
                              ) : (
                                tip.message_short || tip.message
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="tf-mini-cart-view-checkout">
                        <SimartButton
                          href={getLocalizedUrl("/sepetim", lang)}
                          variant="outline"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              const el = document.getElementById("shoppingCart");
                              if (el) {
                                const bootstrap = require("bootstrap");
                                const modal = bootstrap.Modal.getInstance(el);
                                if (modal) modal.hide();
                              }
                              // Hızlı temizlik
                              setTimeout(() => {
                                document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                                document.body.classList.remove('modal-open');
                                document.body.style.overflow = "";
                                document.body.style.paddingRight = "";
                              }, 100);
                            }
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {t.viewCart}
                        </SimartButton>
                        <SimartButton
                          href={getLocalizedUrl("/odeme", lang)}
                          variant="fill"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              const el = document.getElementById("shoppingCart");
                              if (el) {
                                const bootstrap = require("bootstrap");
                                const modal = bootstrap.Modal.getInstance(el);
                                if (modal) modal.hide();
                              }
                              // Hızlı temizlik
                              setTimeout(() => {
                                document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                                document.body.classList.remove('modal-open');
                                document.body.style.overflow = "";
                                document.body.style.paddingRight = "";
                              }, 100);
                            }
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {t.checkout}
                        </SimartButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MaxQuantityToast
        visible={showMaxReachedToast}
        onHide={() => setShowMaxReachedToast(false)}
        maxQuantity={maxQuantityForToast}
      />
    </>
  );
}
