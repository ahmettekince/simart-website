"use client";
import React from "react";
import { useCartStore } from "@/stores/cartStore";
import { products1 } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import { log } from "@/utils/logger";
import CartRecommendations from "./CartRecommendations";
import BirlikteAlSepet from "@/components/common/BirlikteAlSepet";
import Quantity from "@/components/shopDetails/Quantity";
import ClearCartButton from "@/components/common/ClearCartButton";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import { calculateCartTotals } from "@/utils/cartTotals";

export default function ShopCart() {
  const { items, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);

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

  // Items değiştiğinde, artık sepette olmayan ürünlerin loading state'ini temizle
  useEffect(() => {
    const currentItemIds = new Set(items.map(item => String(item.id)));
    setLoadingActions(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(itemId => {
        if (currentItemIds.has(String(itemId))) {
          cleaned[itemId] = prev[itemId];
        }
      });
      return cleaned;
    });
  }, [items]);

  const setQuantity = async (id, quantity, action) => {
    // Minimum 1 kontrolü - 1'den küçük olamaz
    if (quantity < 1 || loadingActions[id]) return;

    setLoadingActions((prev) => ({ ...prev, [id]: action }));
    try {
      await updateQuantity(id, quantity);
    } catch (error) {
      console.error("Miktar güncelleme hatası:", error);
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
    setLoadingActions((prev) => ({ ...prev, [id]: 'remove' }));
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
      const success = await applyCoupon(couponCode.trim());
      if (success) {
        setCouponSuccess(true);
        setCouponCode("");
        setTimeout(() => {
          setCouponSuccess(false);
        }, 3000);
      } else {
        setCouponError("Kupon kodu geçersiz veya kullanılamıyor.");
      }
    } catch (error) {
      // 400/500 hatası durumunda dönen detayı consola bas
      if (error.response) {
        console.log("❌ ShopCart Kupon Hatası Detayı:", error.response.data);
      }
      setCouponError("Kupon uygulanırken bir hata oluştu.");
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
        setCouponError("Kupon kaldırılırken bir hata oluştu.");
      }
    } catch (error) {
      setCouponError("Kupon kaldırılırken bir hata oluştu.");
      log("Kupon kaldırma hatası:", error);
    } finally {
      setIsRemovingCoupon(false);
    }
  };

  return (
    <>
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <div className="title fw-5">
              Sepet
              <ClearCartButton variant="inline" />
            </div>
            <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
          </div>
          <div className="wrap">
            {/* Sepette ürün yoksa API'den önerileri göster */}
            {items.length === 0 && (
              <CartRecommendations showWhenEmpty={true} maxItems={10} />
            )}
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {hasCrossSale && (
                      <div className="tf-mini-cart-item " >
                        <BirlikteAlSepet />
                      </div>
                    )}
                    {(() => {
                      // Normal ürünleri ve gift ürünleri ayır
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

                      // Gift ürünleri, source_product_ids'e göre normal ürünlerin altına yerleştir
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

                      return (
                        <>
                          {groupedItems.map(({ normalItem, giftItems: relatedGifts }, groupIndex) => (
                            <React.Fragment key={normalItem.id || groupIndex}>
                              {/* Normal Ürün */}
                              {(() => {
                                const item = normalItem;
                                const categorySlug =
                                  item.product?.categories?.[0]?.slug || item.product?.primary_category?.slug || "urunler";
                                const productSlug = item.slug || item.id;
                                const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                                const imageUrl =
                                  item.image ||
                                  item.product?.cover_image?.url ||
                                  item.product?.images?.[0] ||
                                  "/images/placeholder.jpg";
                                const isLoading = loadingActions[item.id];
                                const isLoadingDecrease = isLoading === 'decrease';
                                const isLoadingIncrease = isLoading === 'increase';
                                const isAnyLoading = !!isLoading;
                                const rawMax =
                                  item.max_purchase_quantity ?? item.product?.max_purchase_quantity ?? item.product?.max_quantity ?? null;
                                const parsedMax = rawMax === null || rawMax === undefined ? null : Number(rawMax);
                                // maxQuantity = 0 ise sınırsız (null), değilse o değere kadar sınırlı
                                const maxQty = parsedMax === 0 ? null : (Number.isFinite(parsedMax) ? parsedMax : null);
                                const minQty = item.min_purchase_quantity ?? item.product?.min_purchase_quantity ?? 1;

                                return (
                                  <div key={item.id} className={`tf-mini-cart-item ${isAnyLoading ? "disabled-item" : ""}`}>
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
                                        {item.discount_price != null && item.discount_price > 0 && item.discount_price < item.price ? (
                                          <>
                                            <span style={{ color: '#0bc15c', fontWeight: '600', marginRight: '8px' }}>
                                              ₺{item.discount_price.toLocaleString("tr-TR")}
                                            </span>
                                            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                                              ₺{item.price.toLocaleString("tr-TR")}
                                            </span>
                                          </>
                                        ) : (
                                          <span>₺{item.price.toLocaleString("tr-TR")}</span>
                                        )}
                                      </div>
                                      <div className="tf-mini-cart-btns">
                                        <div className={`wg-quantity small ${isAnyLoading ? "disabled" : ""}`} style={{ pointerEvents: isAnyLoading ? "none" : "auto" }}>
                                          <Quantity
                                            isLoading={isAnyLoading}
                                            setQuantity={(qty) => {
                                              if (isAnyLoading) return;
                                              const clamped = maxQty != null && maxQty > 0 ? Math.min(Math.max(Number(qty) || 0, minQty), maxQty) : Math.max(Number(qty) || 0, minQty);
                                              if (clamped >= minQty) setQuantity(item.id, clamped, 'change');
                                            }}
                                            minQuantity={minQty}
                                            maxQuantity={maxQty}
                                            initialValue={item.quantity}
                                            onMaxQuantityReached={() => setShowMaxReachedToast(true)}
                                          />
                                        </div>
                                        <div
                                          className="tf-mini-cart-remove"
                                          style={{
                                            cursor: isAnyLoading ? "not-allowed" : "pointer",
                                            opacity: isAnyLoading ? 0.5 : 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                          }}
                                          onClick={() => {
                                            if (!isAnyLoading) {
                                              handleRemoveItem(item.id);
                                            }
                                          }}
                                        >
                                          {loadingActions[item.id] === 'remove' ? (
                                            <div className="spinner-border spinner-border-sm" role="status" style={{
                                              width: '10px',
                                              height: '10px',
                                              borderWidth: '1.5px',
                                              borderColor: '#3c81b5',
                                              borderRightColor: 'transparent'
                                            }}>
                                              <span className="visually-hidden">Yükleniyor...</span>
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
                                      {/* Kampanya Bilgisi - Sadece ürün bazlı kampanyalar */}
                                      {item.applied_campaign_ids && item.applied_campaign_ids.length > 0 && applied_campaigns && applied_campaigns.length > 0 && (
                                        <div style={{ marginTop: '8px' }}>
                                          {item.applied_campaign_ids.map((campaignId) => {
                                            const campaign = applied_campaigns.find(c => c.id === campaignId);
                                            if (!campaign) return null;

                                            // Sadece ürün bazlı kampanyaları göster (sepet bazlı kampanyalar toplamın altında gösterilecek)
                                            const isProductBasedCampaign = campaign.type === 'x_urun_y_tl' || campaign.type === 'x_alana_y_hediye';
                                            if (!isProductBasedCampaign) return null;

                                            // Kampanya tipine göre mesaj oluştur
                                            let campaignMessage = `${campaign.name} uygulandı`;

                                            if (campaign.type === 'x_urun_y_tl') {
                                              const productPiece = campaign.x_product_piece || campaign.xProductPiece || 0;
                                              const discountValue = campaign.x_discount_value || campaign.xDiscountValue || '0.00';
                                              campaignMessage = `${productPiece}. ürün ${parseFloat(discountValue).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
                                            }

                                            return (
                                              <div
                                                key={campaignId}
                                                style={{
                                                  fontSize: '11px',
                                                  color: '#10b981',
                                                  fontWeight: '500',
                                                  marginTop: '1px',
                                                  padding: '1px 4px',
                                                  backgroundColor: '#fef4eb',
                                                  borderRadius: '4px',
                                                  display: 'inline-block',
                                                  marginRight: '2px'
                                                }}
                                              >
                                                {campaignMessage}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Gift Ürünleri */}
                              {relatedGifts.map((giftItem, giftIndex) => {
                                const categorySlug =
                                  giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                                const productSlug = giftItem.slug || giftItem.id;
                                const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                                const imageUrl =
                                  giftItem.image ||
                                  giftItem.product?.cover_image?.url ||
                                  giftItem.product?.images?.[0] ||
                                  "/images/placeholder.jpg";
                                const giftCampaign = resolveGiftCampaign(giftItem);

                                return (
                                  <div key={`gift-${giftItem.id}-${giftIndex}`} className="tf-mini-cart-item" style={{
                                    marginLeft: '20px',
                                    paddingLeft: '20px',
                                    borderLeft: '3px solid #10b981',
                                    backgroundColor: '#f0fdf4',
                                    opacity: 0.9
                                  }}>
                                    <div className="tf-mini-cart-image">
                                      <Link href={productUrl}>
                                        <Image
                                          alt={giftItem.name}
                                          src={imageUrl}
                                          width={668}
                                          height={932}
                                          style={{ objectFit: "cover" }}
                                        />
                                      </Link>
                                    </div>
                                    <div className="tf-mini-cart-info">
                                      <Link className="title link" href={productUrl} style={{ fontSize: '13px' }}>
                                        {giftItem.name} x{giftItem.quantity}
                                      </Link>
                                      {giftCampaign?.applied_tier?.min_cart_amount ? (
                                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                                          {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına Özel Hediye
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                          {unlinkedGifts.map((giftItem, giftIndex) => {
                            const categorySlug =
                              giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                            const productSlug = giftItem.slug || giftItem.id;
                            const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                            const imageUrl =
                              giftItem.image ||
                              giftItem.product?.cover_image?.url ||
                              giftItem.product?.images?.[0] ||
                              "/images/placeholder.jpg";
                            const giftCampaign = resolveGiftCampaign(giftItem);

                            return (
                              <div key={`gift-unlinked-${giftItem.id}-${giftIndex}`} className="tf-mini-cart-item" style={{
                                marginLeft: '20px',
                                paddingLeft: '20px',
                                borderLeft: '3px solid #10b981',
                                backgroundColor: '#f0fdf4',
                                opacity: 0.9
                              }}>
                                <div className="tf-mini-cart-image">
                                  <Link href={productUrl}>
                                    <Image
                                      alt={giftItem.name}
                                      src={imageUrl}
                                      width={668}
                                      height={932}
                                      style={{ objectFit: "cover" }}
                                    />
                                  </Link>
                                </div>
                                <div className="tf-mini-cart-info">
                                  <Link className="title link" href={productUrl} style={{ fontSize: '13px' }}>
                                    {giftItem.name} x{giftItem.quantity}
                                  </Link>
                                  {giftCampaign?.applied_tier?.min_cart_amount ? (
                                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                                      {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına özel indirim
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                          {tierGifts.map((giftItem, giftIndex) => {
                            const categorySlug =
                              giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                            const productSlug = giftItem.slug || giftItem.id;
                            const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                            const imageUrl =
                              giftItem.image ||
                              giftItem.product?.cover_image?.url ||
                              giftItem.product?.images?.[0] ||
                              "/images/placeholder.jpg";
                            const giftCampaign = resolveGiftCampaign(giftItem);

                            return (
                              <div key={`gift-tier-${giftItem.id}-${giftIndex}`} className="tf-mini-cart-item" style={{
                                marginLeft: '20px',
                                paddingLeft: '20px',
                                borderLeft: '3px solid #10b981',
                                backgroundColor: '#f0fdf4',
                                opacity: 0.9
                              }}>
                                <div className="tf-mini-cart-image">
                                  <Link href={productUrl}>
                                    <Image
                                      alt={giftItem.name}
                                      src={imageUrl}
                                      width={668}
                                      height={932}
                                      style={{ objectFit: "cover" }}
                                    />
                                  </Link>
                                </div>
                                <div className="tf-mini-cart-info">
                                  <Link className="title link" href={productUrl} style={{ fontSize: '13px' }}>
                                    {giftItem.name} x{giftItem.quantity}
                                  </Link>
                                  {giftCampaign?.applied_tier?.min_cart_amount ? (
                                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                                      {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına Özel Hediye
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}

                    {!items.length && (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-4">
                          <div className="col-12 fs-18 text-center mb-3">Sepetinizde ürün bulunmamaktadır.</div>
                          <div className="col-12 text-center">
                            <Link
                              href={`/magaza`}
                              className="tf-btn btn-fill animate-hover-btn radius-3"
                              style={{ width: "fit-content", display: "inline-block" }}
                            >
                              Alışverişe Başla
                            </Link>
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
                  <div className="tf-mini-cart-bottom-wrap" style={{ backgroundColor: '#f5f5f5', boxShadow: '1px 1px 1px 1px black' }}>
                    <div className="tf-cart-totals-discounts">
                      {/* Ara Toplam - Sadece indirim varsa göster */}
                      {cartTotals.subtotal > 0 && cartTotals.hasAnyDiscount && (
                        <div className="tf-cart-totals-item" style={{ borderTop: 'none', borderBottom: 'none' }}>
                          <div className="tf-cart-total-label fw-6" style={{ fontSize: '14px' }}>Ara Toplam</div>
                          <div className="tf-cart-total-value fw-6" style={{ fontSize: '14px' }}>₺{cartTotals.subtotal.toLocaleString("tr-TR")}</div>
                        </div>
                      )}

                      {/* İndirimler Section - Sadece indirim varsa göster */}
                      {(cartTotals.customDiscountAmount > 0 || cartTotals.campaignDiscountAmount > 0 || cartTotals.couponDiscountAmount > 0) && (
                        <div>
                          {/* Size özel indirim */}
                          {cartTotals.customDiscountAmount > 0 && (
                            <div className="tf-cart-totals-item" style={{ borderTop: 'none', borderBottom: 'none' }}>
                              <div className="tf-cart-total-label fw-6" style={{ fontSize: '14px' }}>Size Özel İndirim</div>
                              <div className="tf-cart-total-value fw-6" style={{ fontSize: '14px', color: '#0bc15c' }}>
                                - ₺{cartTotals.customDiscountAmount.toLocaleString("tr-TR")}
                              </div>
                            </div>
                          )}
                          {/* Kampanya İndirimi */}
                          {cartTotals.campaignDiscountAmount > 0 && (
                            <div className="tf-cart-totals-item" style={{ borderTop: 'none', borderBottom: 'none' }}>
                              <div className="tf-cart-total-label fw-6" style={{ fontSize: '14px' }}>Kampanya İndirimi</div>
                              <div className="tf-cart-total-value fw-6" style={{ fontSize: '14px', color: '#0bc15c' }}>
                                - ₺{cartTotals.campaignDiscountAmount.toLocaleString("tr-TR")}
                              </div>
                            </div>
                          )}
                          {/* Kupon İndirimi */}
                          {cartTotals.couponDiscountAmount > 0 && coupon && coupon.code && (
                            <div className="tf-cart-totals-item" style={{ borderTop: 'none', borderBottom: 'none' }}>
                              <div className="tf-cart-total-label fw-6" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Kupon İndirimi:</span>
                                {coupon.code && (
                                  <span style={{ fontWeight: '600', color: '#333' }}>{coupon.code}</span>
                                )}
                                <button
                                  type="button"
                                  onClick={handleRemoveCoupon}
                                  disabled={isRemovingCoupon}
                                  style={{
                                    fontSize: '12px',
                                    color: '#dc3545',
                                    background: 'none',
                                    border: 'none',
                                    cursor: isRemovingCoupon ? 'not-allowed' : 'pointer',
                                    padding: '2px 4px',
                                    opacity: isRemovingCoupon ? 0.5 : 1,
                                    textDecoration: 'underline',
                                    fontWeight: '600',
                                  }}
                                >
                                  {isRemovingCoupon ? 'Kaldırılıyor...' : 'Kaldır'}
                                </button>
                              </div>
                              <div className="tf-cart-total-value fw-6" style={{ fontSize: '14px', color: '#0bc15c' }}>
                                - ₺{cartTotals.couponDiscountAmount.toLocaleString("tr-TR")}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="tf-cart-totals-item tf-cart-totals-item-total" >
                        <div className="tf-cart-total-label fw-6" style={{ fontSize: '18px' }}>Toplam</div>
                        <div className="tf-cart-total-value fw-6" style={{ fontSize: '18px' }}>₺{cartTotals.total.toLocaleString("tr-TR")}</div>
                      </div>
                      {/* Sepet bazlı kampanya mesajları */}
                      {applied_campaigns && applied_campaigns.length > 0 && (() => {
                        // Tüm ürün bazlı kampanya ID'lerini topla
                        const productBasedCampaignIds = new Set();
                        items.forEach(item => {
                          if (item.applied_campaign_ids && Array.isArray(item.applied_campaign_ids)) {
                            item.applied_campaign_ids.forEach(id => productBasedCampaignIds.add(id));
                          }
                        });

                        // Sepet bazlı kampanyaları filtrele (ürün bazlı olmayanlar)
                        const cartBasedCampaigns = applied_campaigns.filter(campaign => {
                          // Ürün bazlı kampanya tipleri
                          const isProductBasedType = campaign.type === 'x_urun_y_tl' || campaign.type === 'x_alana_y_hediye';
                          // Eğer kampanya ID'si hiçbir ürünün applied_campaign_ids'inde yoksa, sepet bazlıdır
                          const isNotInAnyProduct = !productBasedCampaignIds.has(campaign.id);
                          // next_tier mesajı olan kampanyalar da sepet bazlıdır
                          const hasNextTier = campaign.next_tier?.message;

                          return !isProductBasedType && (isNotInAnyProduct || hasNextTier);
                        });

                        if (cartBasedCampaigns.length === 0) return null;

                        return (
                          <div style={{ marginTop: '8px' }}>
                            {cartBasedCampaigns.map((campaign, idx) => {
                              // next_tier mesajı varsa onu göster (kırmızı)
                              if (campaign.next_tier?.message) {
                                return (
                                  <div key={`next-tier-${campaign.id || idx}`} style={{ color: '#dc3545', fontSize: '11px', lineHeight: '1.4', marginBottom: '4px' }}>
                                    {campaign.next_tier.message}
                                  </div>
                                );
                              }
                              // Diğer sepet bazlı kampanyalar için kampanya adını göster
                              return (
                                <div key={`cart-campaign-${campaign.id || idx}`} style={{ color: '#10b981', fontSize: '11px', lineHeight: '1.4', marginBottom: '4px' }}>
                                  {campaign.name} uygulandı
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
                        <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
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
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              border: couponError ? "1px solid #dc3545" : couponSuccess ? "1px solid #0bc15c" : "1px solid #e5e5e5",
                              borderRadius: "6px",
                              fontSize: "16px",
                              height: "36px",
                            }}
                            disabled={isApplyingCoupon}
                          />
                          <button
                            type="submit"
                            className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            style={{
                              opacity: isApplyingCoupon || !couponCode.trim() ? 0.6 : 1,
                              cursor: isApplyingCoupon || !couponCode.trim() ? "not-allowed" : "pointer",
                              height: "36px",
                              padding: "6px 12px",
                            }}
                          >
                            {isApplyingCoupon ? "Uygulanıyor..." : "Uygula"}
                          </button>
                        </form>
                        {couponError && (
                          <div style={{ marginTop: "8px", fontSize: "12px", color: "#dc3545" }}>
                            {couponError}
                          </div>
                        )}
                        {couponSuccess && (
                          <div style={{ marginTop: "8px", fontSize: "12px", color: "#0bc15c" }}>
                            Kupon kodu başarıyla uygulandı!
                          </div>
                        )}
                      </div>
                    )}

                    <div className="tf-mini-cart-view-checkout">
                      <Link href={`/sepetim`} className="tf-btn btn-outline radius-3 link w-100 justify-content-center">
                        Sepeti Görüntüle
                      </Link>
                      <Link
                        href={`/odeme`}
                        className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      >
                        <span>Sipariş ver</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} />
    </>
  );
}
