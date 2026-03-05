"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { log } from "@/utils/logger";

const GIFT_NOTE_KEY = "cart_gift_note";

export default function OrderSummary({
  items,
  cartTotals,
  onSubmitOrder,
  isSubmitting = false,
  orderErrors = {},
  orderErrorMessage = "",
  onOrderNoteChange,
  onGiftNoteChange,
  onShowOrderNoteChange,
  onShowGiftNoteChange,
  // Sözleşme onayı
  acceptedAgreements,
  onAcceptedAgreementsChange,
  // İleri tarihli kargo
  preferLaterDelivery = false,
  preferredDeliveryDate = "",
  onPreferLaterDeliveryChange,
  onPreferredDeliveryDateChange,
  buttonText = "Sipariş Ver",
  showNotes = true,
  showAgreements = true,
  showProductList = true,
  title = "Sipariş Bilgileri"
}) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [showGiftNote, setShowGiftNote] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const { applyCoupon, removeCoupon } = useCartStore();
  const coupon = useCartStore((state) => state.coupon);
  const isCartSynced = useCartStore((state) => state.isSynced);
  /* Logic copied and adapted from ShopCart.jsx for Campaign and Gift display */
  const applied_campaigns = useCartStore((state) => state.applied_campaigns);
  const cartTips = useCartStore((state) => state.totals?.cart_tips);

  // Normal items and gift items separation
  const normalItems = items.filter(item => !item.is_gift);
  const giftItems = items.filter(item => item.is_gift);

  const giftCampaignById = new Map();
  const resolveGiftCampaign = (giftItem) => {
    if (!applied_campaigns || applied_campaigns.length === 0) return null;
    const key = giftItem.id || giftItem.productId || giftItem.product?.id;
    if (giftCampaignById.has(key)) return giftCampaignById.get(key);
    const giftProductId = giftItem.productId || giftItem.product?.id;
    const found = applied_campaigns.find((campaign) => {
      const isApplied = giftItem.applied_campaign_ids?.includes(campaign.id);
      const isGiftMatch = campaign.gift_items?.some(
        (gift) => gift.product_id === giftProductId
      );
      return isApplied || isGiftMatch;
    }) || null;
    giftCampaignById.set(key, found);
    return found;
  };

  const tierGifts = giftItems.filter(
    (giftItem) => resolveGiftCampaign(giftItem)?.applied_tier?.min_cart_amount
  );
  const nonTierGifts = giftItems.filter(
    (giftItem) => !resolveGiftCampaign(giftItem)?.applied_tier?.min_cart_amount
  );

  // Link gifts to source products
  const linkedGiftIds = new Set();
  const groupedItems = normalItems.map(normalItem => {
    const relatedGifts = nonTierGifts.filter((giftItem) => {
      const hasLink = Array.isArray(giftItem.source_product_ids) &&
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

  // Determine cart-based campaigns
  const cartBasedCampaigns = applied_campaigns && applied_campaigns.length > 0 ? (() => {
    const productBasedCampaignIds = new Set();
    items.forEach(item => {
      if (item.applied_campaign_ids && Array.isArray(item.applied_campaign_ids)) {
        item.applied_campaign_ids.forEach(id => productBasedCampaignIds.add(id));
      }
    });

    return applied_campaigns.filter(campaign => {
      const isProductBasedType = campaign.type === 'x_urun_y_tl' || campaign.type === 'x_alana_y_hediye';
      const isNotInAnyProduct = !productBasedCampaignIds.has(campaign.id);
      const hasNextTier = campaign.next_tier?.message;
      return !isProductBasedType && (isNotInAnyProduct || hasNextTier);
    });
  })() : [];

  const findTargetProductForCampaign = (campaign) => {
    if (!campaign.name) return null;
    const match = campaign.name.match(/alana\s+([^0-9]+?)(?:\s+\d+|\s+Kampanyası|$)/i);
    if (match && match[1]) {
      const productNameInMessage = match[1].trim();
      return normalItems.find(item => {
        const itemName = (item.name || '').toLowerCase();
        const searchName = productNameInMessage.toLowerCase();
        return itemName.includes(searchName) || searchName.includes(itemName);
      });
    }
    return null;
  };

  const getCampaignMessagesForProduct = (productItem) => {
    const messages = [];
    cartBasedCampaigns
      .filter(campaign => {
        const targetProduct = findTargetProductForCampaign(campaign);
        return targetProduct && targetProduct.id === productItem.id;
      })
      .forEach(campaign => {
        messages.push({
          campaign,
          message: campaign.next_tier?.message || `${campaign.name} `,
          isNextTier: !!campaign.next_tier?.message
        });
      });

    if (productItem.applied_campaign_ids && Array.isArray(productItem.applied_campaign_ids) && applied_campaigns) {
      productItem.applied_campaign_ids.forEach(campaignId => {
        const campaign = applied_campaigns.find(c => c.id === campaignId);
        if (campaign && campaign.type === 'x_al_y_ode') {
          if (!messages.some(m => m.campaign.id === campaign.id)) {
            messages.push({
              campaign,
              message: `${campaign.name} `,
              isNextTier: false
            });
          }
        }
      });
    }
    return messages;
  };

  // Sayfa yüklendiğinde localStorage'dan hediye notunu oku (sipariş notu localStorage'dan okunmayacak)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGiftNote = localStorage.getItem(GIFT_NOTE_KEY);
      if (savedGiftNote) {
        setGiftNote(savedGiftNote);
        setShowGiftNote(true);
        if (onGiftNoteChange) {
          onGiftNoteChange(savedGiftNote);
        }
        if (onShowGiftNoteChange) {
          onShowGiftNoteChange(true);
        }
      }
    }
  }, [onGiftNoteChange, onShowGiftNoteChange]);

  // Sipariş notu değiştiğinde parent component'e bildir (localStorage'a kaydetme)
  const handleOrderNoteChange = (value) => {
    setOrderNote(value);
    if (onOrderNoteChange) {
      onOrderNoteChange(value);
    }
  };

  // Checkbox değiştiğinde
  const handleShowOrderNoteChange = (e) => {
    const checked = e.target.checked;
    setShowOrderNote(checked);
    // Parent component'e checkbox durumunu bildir
    if (onShowOrderNoteChange) {
      onShowOrderNoteChange(checked);
    }
    if (!checked) {
      // Checkbox kapatıldığında notu temizle
      handleOrderNoteChange("");
    }
  };

  // Hediye notu değiştiğinde parent component'e bildir ve localStorage'a kaydet
  const handleGiftNoteChange = (value) => {
    setGiftNote(value);
    if (onGiftNoteChange) {
      onGiftNoteChange(value);
    }
    if (typeof window !== "undefined") {
      if (value && value.trim()) {
        localStorage.setItem(GIFT_NOTE_KEY, value);
      } else {
        localStorage.removeItem(GIFT_NOTE_KEY);
      }
    }
  };

  // Hediye notu checkbox değiştiğinde
  const handleShowGiftNoteChange = (e) => {
    const checked = e.target.checked;
    setShowGiftNote(checked);
    // Parent component'e checkbox durumunu bildir
    if (onShowGiftNoteChange) {
      onShowGiftNoteChange(checked);
    }
    if (!checked) {
      // Checkbox kapatıldığında notu temizle
      handleGiftNoteChange("");
    }
  };

  // Debug: Kupon bilgisini kontrol et
  useEffect(() => {
    log("[OrderSummary] Coupon state changed:", coupon);
  }, [coupon]);

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
        const code = couponCode.trim();
        setCouponCode("");
        setTimeout(() => setCouponSuccess(false), 3000);
      } else {
        setCouponError((result && result.message) || "Uygulanamadı");
        setTimeout(() => setCouponError(""), 4000);
      }
    } catch (error) {
      setCouponError("Uygulanamadı");
      setTimeout(() => setCouponError(""), 4000);
      console.error("Kupon uygulama hatası:", error);
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
        setCouponError("Kupon kaldırılırken bir hata oluştu.");
        setTimeout(() => setCouponError(""), 4000);
      }
    } catch (error) {
      setCouponError("Kupon kaldırılırken bir hata oluştu.");
      setTimeout(() => setCouponError(""), 4000);
      console.error("Kupon kaldırma hatası:", error);
    } finally {
      setIsRemovingCoupon(false);
    }
  };

  // Sepet henüz API'den yüklenmediyse skeleton göster (sadece ilk adım yüksekliği - sayfa boyu değil)
  if (!isCartSynced) {
    return (
      <div className="tf-page-cart-footer">
        <div className="tf-cart-footer-inner order-summary-skeleton order-summary-skeleton-step1-only">
          <div className="skeleton-content skeleton-rect skeleton-title" />
          <div className="skeleton-product-list">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton-product-item">
                <div className="skeleton-content skeleton-img" />
                <div className="skeleton-product-info">
                  <div className="skeleton-content skeleton-rect skeleton-line" />
                  <div className="skeleton-content skeleton-rect skeleton-line" />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-content skeleton-coupon" />
          <div className="skeleton-totals">
            <div className="skeleton-content skeleton-rect skeleton-total-row" />
            <div className="skeleton-content skeleton-rect skeleton-total-row" style={{ width: "80%" }} />
          </div>
          <div className="skeleton-divider" />
          <div className="skeleton-content skeleton-rect skeleton-total-main" />
        </div>
      </div>
    );
  }

  return (
    <div className="tf-page-cart-footer">
      <div className="tf-cart-footer-inner">
        <h5 className="fw-5 mb_20">{title}</h5>
        <form onSubmit={(e) => e.preventDefault()} className="tf-page-cart-checkout widget-wrap-checkout">
          {showProductList && (
            <ul className="wrap-checkout-product">
              {groupedItems.map(({ normalItem, giftItems: relatedGifts }, groupIndex) => {

                return (
                  <li key={normalItem.id || groupIndex} style={{ display: 'block', borderBottom: '1px solid #e5e5e5', paddingBottom: '15px', marginBottom: '15px' }}>
                    {/* Normal Ürün */}
                    {(() => {
                      const item = normalItem;
                      const categorySlug =
                        item.product?.category_slug ||
                        item.product?.categories?.[0]?.slug ||
                        item.product?.item_category?.slug ||
                        "urunler";
                      const productSlug = item.product?.slug || item.slug || item.id;
                      const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                      const imageUrl =
                        item.image ||
                        item.product?.cover_image?.url ||
                        item.product?.images?.[0] ||
                        "/images/placeholder.jpg";
                      const discountAmount = item.discount_amount ?? item.discountAmount ?? null;
                      const discountPrice = item.discount_price ?? item.discountPrice ?? null;
                      const regularPrice = item.price ?? item.product?.price ?? null;

                      let displayRegularPrice = regularPrice || discountPrice || 0;
                      let displayDiscountPrice = null;

                      if (discountAmount != null && discountPrice != null && discountAmount < discountPrice) {
                        displayRegularPrice = discountPrice;
                        displayDiscountPrice = discountAmount;
                      } else if (discountAmount != null && regularPrice != null && discountAmount < regularPrice) {
                        displayRegularPrice = regularPrice;
                        displayDiscountPrice = discountAmount;
                      } else if (discountPrice != null && regularPrice != null && discountPrice < regularPrice) {
                        displayRegularPrice = regularPrice;
                        displayDiscountPrice = discountPrice;
                      }

                      const itemPrice = displayDiscountPrice ?? displayRegularPrice;
                      const itemTotal = itemPrice * item.quantity;
                      const itemCampaignMessages = getCampaignMessagesForProduct(item);

                      return (
                        <div className="checkout-product-item" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                          <figure className="img-product">
                            <Link href={productUrl}>
                              <Image alt={item.name || "Ürün"} src={imageUrl} width={720} height={1005} />
                            </Link>
                            <span className="quantity">{item.quantity}</span>
                          </figure>
                          <div className="content">
                            <div className="info">
                              <Link href={productUrl} className="name">
                                {item.name}
                              </Link>
                              {/* Ürün bazlı kampanya mesajları */}
                              {itemCampaignMessages.length > 0 && (
                                <div style={{ marginTop: '4px' }}>
                                  {itemCampaignMessages.map(({ campaign, message, isNextTier }, idx) => (
                                    <div key={`product-campaign-${campaign.id || idx}`} style={{ fontSize: '11px', color: isNextTier ? '#dc3545' : '#0bc15c', lineHeight: '1.4' }}>
                                      {message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="price">
                              {displayDiscountPrice != null && displayRegularPrice != null && displayDiscountPrice < displayRegularPrice ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                  <span style={{ color: '#0bc15c', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                    {(displayDiscountPrice * item.quantity).toLocaleString("tr-TR")} TL
                                  </span>
                                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                    {(displayRegularPrice * item.quantity).toLocaleString("tr-TR")} TL
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: '#3c81b5', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                  {(displayRegularPrice * item.quantity).toLocaleString("tr-TR")} TL
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Linked Gifts */}
                    {relatedGifts.map((giftItem, giftIndex) => {
                      const categorySlug = giftItem.product?.categories?.[0]?.slug || "urunler";
                      const productSlug = giftItem.product?.slug || giftItem.slug || giftItem.id;
                      const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                      const giftSourceNames = (giftItem.applied_campaign_ids && applied_campaigns
                        ? giftItem.applied_campaign_ids
                          .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                          .filter(Boolean)
                        : []
                      );
                      const giftCampaign = resolveGiftCampaign(giftItem);

                      return (
                        <div key={`gift-${giftItem.id}-${giftIndex}`} style={{
                          marginTop: '10px',
                          backgroundColor: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div className="img-product" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                            <Link href={productUrl} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
                                <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="var(--primary, #3c81b5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Link>
                          </div>
                          <div className="content" style={{ flex: 1 }}>
                            <div className="info">
                              <Link href={productUrl} className="name" style={{ fontSize: '13px', fontWeight: '500', color: '#141414', lineHeight: '1.4', display: 'block', marginBottom: '2px' }}>
                                {giftItem.name} <span style={{ color: '#0bc15c', fontWeight: 'bold' }}>x{giftItem.quantity}</span>
                              </Link>
                              {giftSourceNames.length > 0 ? (
                                <div style={{ fontSize: '11px', color: '#0bc15c' }}>
                                  {giftSourceNames.join(", ")}
                                </div>
                              ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                <div style={{ fontSize: '11px', color: '#0bc15c' }}>
                                  {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına Özel Hediye
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </li>
                );
              })}

              {/* Unlinked Gifts */}
              {unlinkedGifts.map((giftItem, giftIndex) => {
                const categorySlug = giftItem.product?.categories?.[0]?.slug || "urunler";
                const productSlug = giftItem.product?.slug || giftItem.slug || giftItem.id;
                const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                const giftSourceNames = (giftItem.applied_campaign_ids && applied_campaigns
                  ? giftItem.applied_campaign_ids
                    .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                    .filter(Boolean)
                  : []
                );
                const giftCampaign = resolveGiftCampaign(giftItem);

                return (
                  <li key={`gift-unlinked-${giftItem.id}-${giftIndex}`} style={{
                    marginBottom: '10px',
                    backgroundColor: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div className="img-product" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                      <Link href={productUrl} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
                          <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="var(--primary, #3c81b5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                    <div className="content" style={{ flex: 1 }}>
                      <div className="info">
                        <Link href={productUrl} className="name" style={{ fontSize: '13px', fontWeight: '500', color: '#141414', lineHeight: '1.4', display: 'block', marginBottom: '2px' }}>
                          {giftItem.name} <span style={{ color: '#0bc15c', fontWeight: 'bold' }}>x{giftItem.quantity}</span>
                        </Link>
                        {giftSourceNames.length > 0 ? (
                          <div style={{ fontSize: '11px', color: '#0bc15c' }}>
                            {giftSourceNames.join(", ")}
                          </div>
                        ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                          <div style={{ fontSize: '11px', color: '#0bc15c' }}>
                            {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına özel indirim
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}

              {/* Tier Gifts */}
              {tierGifts.map((giftItem, giftIndex) => {
                const categorySlug = giftItem.product?.categories?.[0]?.slug || "urunler";
                const productSlug = giftItem.product?.slug || giftItem.slug || giftItem.id;
                const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                const giftSourceNames = (giftItem.applied_campaign_ids && applied_campaigns
                  ? giftItem.applied_campaign_ids
                    .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                    .filter(Boolean)
                  : []
                );
                const giftCampaign = resolveGiftCampaign(giftItem);

                return (
                  <li key={`gift-tier-${giftItem.id}-${giftIndex}`} style={{
                    marginBottom: '10px',
                    backgroundColor: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '12px',
                    borderLeft: '3px solid #0bc15c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div className="img-product" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                      <Link href={productUrl} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '36px', height: '36px' }}>
                          <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="var(--primary, #3c81b5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                    <div className="content" style={{ flex: 1 }}>
                      <div className="info">
                        <Link href={productUrl} className="name" style={{ fontSize: '13px', fontWeight: '500', color: '#141414', lineHeight: '1.4', display: 'block', marginBottom: '2px' }}>
                          {giftItem.name} <span style={{ color: '#0bc15c', fontWeight: 'bold' }}>x{giftItem.quantity}</span>
                        </Link>
                        {giftSourceNames.length > 0 ? (
                          <div style={{ fontSize: '11px', color: '#0bc15c' }}>
                            {giftSourceNames.join(", ")}
                          </div>
                        ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                          <div style={{ fontSize: '11px', color: '#0bc15c' }}>
                            {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına Özel Hediye
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {!items.length && showProductList && (
            <div className="container">
              <div className="row align-items-center mt-5 mb-5">
                <div className="col-12 fs-18">Sepetiniz boş</div>
                <div className="col-12 mt-3">
                  <Link
                    href={`/magaza`}
                    className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                    style={{ width: "fit-content" }}
                  >
                    Ürünleri Keşfet
                  </Link>
                </div>
              </div>
            </div>
          )}
          {/* Kupon Kodu - Sadece kupon yoksa göster */}
          {(!coupon || !coupon.code) && (
            <div className="coupon-box">
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <input
                  type="text"
                  placeholder="Kupon Kodu"
                  value={couponCode}
                  onChange={(e) => {
                    // Boşlukları temizle ve tek kelime olarak al
                    const value = e.target.value.replace(/\s/g, '').toUpperCase();
                    setCouponCode(value);
                    setCouponError("");
                    setCouponSuccess(false);
                  }}
                  onKeyDown={(e) => {
                    // Enter tuşuna basıldığında kuponu uygula
                    if (e.key === "Enter" && couponCode.trim() && !isApplyingCoupon) {
                      e.preventDefault();
                      handleApplyCoupon(e);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    border: couponError ? "1px solid #dc3545" : couponSuccess ? "1px solid #0bc15c" : "1px solid #e5e5e5",
                    borderRadius: "6px",
                    fontSize: "14px",
                    height: "36px",
                  }}
                  disabled={isApplyingCoupon}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="tf-btn btn-sm btn-fill btn-icon animate-hover-btn"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  style={{
                    opacity: isApplyingCoupon || !couponCode.trim() ? 0.6 : 1,
                    cursor: isApplyingCoupon || !couponCode.trim() ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    height: "36px",
                    padding: "6px 12px",
                    borderRadius: "12px",
                  }}
                >
                  {isApplyingCoupon ? "Uygulanıyor..." : "Uygula"}
                </button>
              </div>
              {couponError && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#dc3545" }}>
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#0bc15c" }}>
                  Kupon kodu başarıyla !
                </div>
              )}
            </div>
          )}
          {/* Fiyatlar Container - Cart modal'daki gibi gap kullanarak spacing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Ara Toplam - Sadece indirim varsa göster */}
            {cartTotals.subtotal > 0 && cartTotals.hasAnyDiscount && (
              <div className="d-flex justify-content-between">
                <h6 className="fw-5" style={{ fontSize: "14px" }}>
                  Ara Toplam
                </h6>
                <h6 className="fw-5" style={{ fontSize: "14px" }}>
                  {cartTotals.subtotal.toLocaleString("tr-TR")} TL
                </h6>
              </div>
            )}

            {/* İndirimler Section - Sadece indirim varsa göster */}
            {cartTotals.customDiscountAmount > 0 && (
              <div className="d-flex justify-content-between">
                <h6 className="fw-5" style={{ fontSize: "14px" }}>
                  Size Özel İndirim
                </h6>
                <h6 className="fw-5" style={{ fontSize: "14px", color: "#0bc15c" }}>
                  -{cartTotals.customDiscountAmount.toLocaleString("tr-TR")} TL
                </h6>
              </div>
            )}
            {cartTotals.campaignDiscountAmount > 0 && (
              <div className="d-flex justify-content-between">
                <h6 className="fw-5" style={{ fontSize: "14px" }}>
                  Kampanya İndirimi
                </h6>
                <h6 className="fw-5" style={{ fontSize: "14px", color: "#0bc15c" }}>
                  -{cartTotals.campaignDiscountAmount.toLocaleString("tr-TR")} TL
                </h6>
              </div>
            )}
            {cartTotals.couponDiscountAmount > 0 && coupon && coupon.code && (
              <div className="d-flex justify-content-between">
                <h6 className="fw-5" style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Kupon İndirimi:</span>
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
                    {isRemovingCoupon ? "Kaldırılıyor..." : "Kaldır"}
                  </button>
                </h6>
                <h6 className="fw-5" style={{ fontSize: "14px", color: "#0bc15c" }}>
                  -{cartTotals.couponDiscountAmount.toLocaleString("tr-TR")} TL
                </h6>
              </div>
            )}

            {/* Sepet bazlı kampanya mesajları */}
            {applied_campaigns && applied_campaigns.length > 0 && (() => {
              // Ürünle eşleşmeyen kampanyaları bul (fallback)
              const unmatchedCampaigns = cartBasedCampaigns.filter(campaign => {
                const match = campaign.name?.match(/alana\s+([^0-9]+?)(?:\s+\d+|\s+Kampanyası|$)/i);
                if (match && match[1]) {
                  const productNameInMessage = match[1].trim().toLowerCase();
                  return !normalItems.some(item => {
                    const itemName = (item.name || '').toLowerCase();
                    return itemName.includes(productNameInMessage) || productNameInMessage.includes(itemName);
                  });
                }
                return true;
              });

              if (unmatchedCampaigns.length === 0) return null;

              return (
                <div style={{ marginTop: '8px' }}>
                  {unmatchedCampaigns.map((campaign, idx) => {
                    if (campaign.next_tier?.message) {
                      return (
                        <div key={`next-tier-${campaign.id || idx}`} style={{ color: '#dc3545', fontSize: '11px', lineHeight: '1.4', marginBottom: '4px' }}>
                          {campaign.next_tier.message}
                        </div>
                      );
                    }
                    return (
                      <div key={`cart-campaign-${campaign.id || idx}`} style={{ color: '#0bc15c', fontSize: '11px', lineHeight: '1.4', marginBottom: '4px' }}>
                        {campaign.name}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <div className="d-flex justify-content-between" style={{ borderTop: "1px solid #e5e5e5", paddingTop: "10px", marginTop: "10px" }}>
            <h6 className="fw-5" style={{ fontSize: "18px" }}>Toplam</h6>
            <h6 className="total fw-5" style={{ fontSize: "18px" }}>{cartTotals.total.toLocaleString("tr-TR")} TL</h6>
          </div>

          {/* Sepet İpuçları (Cart Tips) */}
          {cartTips && Array.isArray(cartTips) && cartTips.length > 0 && (
            <div style={{ marginTop: "12px", marginBottom: "12px" }}>
              {cartTips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "8px",
                    fontSize: "13px",
                    color: "#10b981",
                    lineHeight: "1.5",
                  }}
                >
                  {tip.product_name ? (
                    <>
                      <span style={{ fontWeight: "700" }}>
                        {tip.product_name}
                      </span>{" "}
                      ürününden {tip.message_short || tip.message}
                    </>
                  ) : (
                    tip.message_short || tip.message
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Sipariş Notu - Checkbox ile kontrol edilebilir */}

          {showNotes && (
            <>
              <div className="box-checkbox fieldset-radio " style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="show-order-note"
                  className="tf-check"
                  checked={showOrderNote}
                  onChange={handleShowOrderNoteChange}
                  style={{ flexShrink: 0 }}
                />
                <label htmlFor="show-order-note" className="text_black-2" >
                  Sipariş notu eklemek istiyorum (isteğe bağlı)
                </label>
              </div>
              {showOrderNote && (
                <div>
                  <textarea
                    id="order-note"
                    value={orderNote}
                    onChange={(e) => handleOrderNoteChange(e.target.value)}
                    placeholder="Siparişinizle ilgili özel bir notunuz varsa buraya yazabilirsiniz..."
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "10px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}

              {/* Hediye Notu - Checkbox ile kontrol edilebilir */}

              <div className="box-checkbox fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="show-gift-note"
                  className="tf-check"
                  checked={showGiftNote}
                  onChange={handleShowGiftNoteChange}
                  style={{ flexShrink: 0 }}
                />
                <label htmlFor="show-gift-note" className="text_black-2" style={{ margin: 0, padding: 0 }}>
                  Hediye notu eklemek istiyorum (isteğe bağlı)
                </label>
              </div>
              {showGiftNote && (
                <div>
                  <textarea
                    id="gift-note"
                    value={giftNote}
                    onChange={(e) => handleGiftNoteChange(e.target.value)}
                    placeholder="Hediye paketi için özel bir notunuz varsa buraya yazabilirsiniz..."
                    style={{
                      width: "100%",
                      minHeight: "40px",
                      padding: "10px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}

              {/* İleri tarihli kargo - hediye notunun hemen altında */}
              <div
                className="box-checkbox fieldset-radio"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  id="prefer-later-delivery"
                  className="tf-check"
                  checked={preferLaterDelivery}
                  onChange={(e) => {
                    onPreferLaterDeliveryChange &&
                      onPreferLaterDeliveryChange(e.target.checked);
                  }}
                  style={{ flexShrink: 0 }}
                />
                <label
                  htmlFor="prefer-later-delivery"
                  className="text_black-2"
                  style={{ margin: 0, padding: 0 }}
                >
                  Siparişimin ileri bir tarihte kargoya verilmesini istiyorum (isteğe bağlı)
                </label>
              </div>
              {preferLaterDelivery && (
                <div style={{ paddingLeft: "26px", marginTop: "8px" }}>

                  <input
                    type="date"
                    className="form-control mb_8"
                    value={preferredDeliveryDate}
                    onChange={(e) =>
                      onPreferredDeliveryDateChange &&
                      onPreferredDeliveryDateChange(e.target.value)
                    }
                    min={new Date().toISOString().slice(0, 10)}
                    style={{ maxWidth: "220px" }}
                  />
                  <p className="text-muted mb_0" style={{ fontSize: "12px" }}>
                    Resmi tatillere ve pazar günlerine denk gelen siparişlerde süre değişiklik gösterebilir.
                  </p>
                </div>
              )}

            </>
          )}
          {(showAgreements ||
            orderErrorMessage ||
            Object.keys(orderErrors).length > 0) && (
              <div className="wd-check-payment" style={{ marginTop: "30px", paddingTop: "30px", borderTop: "1px solid #e5e5e5" }}>
                {showAgreements && (
                  <div className="mb_20" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div className="box-checkbox fieldset-radio" style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="check-agreements"
                        className="tf-check"
                        checked={acceptedAgreements}
                        onChange={(e) => onAcceptedAgreementsChange(e.target.checked)}
                        style={{ marginTop: "3px", flexShrink: 0 }}
                      />
                      <label htmlFor="check-agreements" className="text_black-2" style={{ margin: 0, lineHeight: "1.5" }}>
                        <Link href="/gizlilik-politikasi" target="_blank" style={{ textDecoration: "underline" }}>Gizlilik Politikasını</Link>,{" "}
                        <Link href="/sartlar-kosullar" target="_blank" style={{ textDecoration: "underline" }}>Şartlar ve Koşulları</Link> ve{" "}
                        <Link href="/iade-ve-geri-odeme-politikasi" target="_blank" style={{ textDecoration: "underline" }}>İade ve Geri Ödeme Politikasını</Link> okudum, kabul ediyorum.
                      </label>
                    </div>
                  </div>
                )}

                {/* Genel Hata Mesajı - Sadece spesifik hatalar (orderErrors) boşsa göster */}
                {orderErrorMessage && Object.keys(orderErrors).length === 0 && (
                  <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                    {orderErrorMessage}
                  </div>
                )}

                {/* Form Alanı Hata Mesajları (E-posta, Adres, Kart vb.) */}
                {Object.keys(orderErrors).length > 0 && (
                  <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "12px", fontSize: "14px", color: "#c33" }}>
                    {Object.entries(orderErrors).map(([key, messages]) => (
                      <div key={key} style={{ marginBottom: "4px" }}>
                        • {Array.isArray(messages) ? messages[0] : messages}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          <button
            type="button"
            onClick={onSubmitOrder}
            disabled={isSubmitting}
            className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center"
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Gönderiliyor..." : buttonText}
          </button>
        </form>
      </div >
    </div >
  );
}
