"use client";
import React, { useMemo } from "react";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { calculateCartTotals } from "@/utils/cartTotals";
import Quantity from "@/components/shopDetails/Quantity";
import OrderSummary from "@/components/othersPages/checkout/OrderSummary";
import ClearCartButton from "@/components/common/ClearCartButton";
import BirlikteAlSepet from "@/components/common/BirlikteAlSepet";
import { useRouter } from "next/navigation";

export default function Cart() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isSynced = useCartStore((state) => state.isSynced);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const applied_campaigns = useCartStore((state) => state.applied_campaigns);
  const totals = useCartStore((state) => state.totals);
  const cross_sale_campaigns = useCartStore((state) => state.cross_sale_campaigns);
  const hasCrossSale = Array.isArray(cross_sale_campaigns) && cross_sale_campaigns.length > 0;

  const [loadingQuantityFor, setLoadingQuantityFor] = React.useState(null);

  // Totals hesaplamasÄ±nÄ± useMemo ile memoize et
  const cartTotals = useMemo(() => {
    return calculateCartTotals(totals, items);
  }, [totals, items]);

  const handleCheckoutRedirect = () => {
    router.push("/odeme");
  };

  const setItemQuantity = async (id, quantity) => {
    if (quantity >= 1) {
      setLoadingQuantityFor(id);
      try {
        await updateQuantity(id, quantity);
      } catch (error) {
        console.error("Miktar gÃ¼ncelleme hatasÄ±:", error);
      } finally {
        setLoadingQuantityFor(null);
      }
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error("ÃœrÃ¼n kaldÄ±rma hatasÄ±:", error);
    }
  };

  // Sepet henÃ¼z API'den yÃ¼klenmediyse boÅŸ gÃ¶sterme â€“ Ã¶nce yÃ¼kleme gÃ¶ster
  if (!isSynced) {
    return (
      <section className="flat-spacing-11 page-cart-sepetim">
        <div className="container">
          <div className="tf-page-cart-wrap">
            <div className="tf-page-cart-item">
              <div className="d-flex justify-content-between align-items-center mb_20">
                <h5 className="fw-5">Sepetteki ÃœrÃ¼nler</h5>
              </div>
              <div className="text-center py-5">
                <p className="text-muted mb-0">Sepet yÃ¼kleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-11 page-cart-sepetim">
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          <div className="tf-page-cart-item">
            {/* Ã‡apraz satÄ±ÅŸ (Birlikte Al) - Sepetteki ÃœrÃ¼nler'in Ã¼stÃ¼nde, sadece sol sÃ¼tunda */}
            {hasCrossSale && (
              <div className="mb_24">
                <BirlikteAlSepet />
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb_20">
              <h5 className="fw-5">Sepetteki ÃœrÃ¼nler</h5>
              <ClearCartButton variant="button" />
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <table className="tf-table-page-cart">
                <thead>
                  <tr>
                    <th>ÃœrÃ¼n</th>
                    <th>Fiyat</th>
                    <th>Miktar</th>
                    <th>Toplam</th>
                    <th style={{ width: "48px" }} aria-label="KaldÄ±r" />
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Logic from OrderSummary.jsx to categorize items and gifts
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

                    // Cart based campaigns logic for messages
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
                      const match = campaign.name.match(/alana\s+([^0-9]+?)(?:\s+\d+|\s+KampanyasÄ±|$)/i);
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


                    return (
                      <>
                        {groupedItems.map(({ normalItem, giftItems: relatedGifts }, groupIndex) => (
                          <React.Fragment key={normalItem.id || groupIndex}>
                            {(() => {
                              const item = normalItem;
                              const itemPrice = item.discount_price || item.price || 0;
                              const itemTotal = itemPrice * item.quantity;
                              const categorySlug = item.product?.categories?.[0]?.slug || item.product?.primary_category?.slug || "urunler";
                              const minQty = Number(item.min_purchase_quantity ?? item.product?.min_purchase_quantity ?? 1) || 1;
                              const rawMax = item.max_purchase_quantity ?? item.product?.max_purchase_quantity ?? item.product?.max_quantity ?? null;
                              const parsedMax = rawMax === null || rawMax === undefined ? null : Number(rawMax);
                              const maxQty = parsedMax === 0 ? null : (Number.isFinite(parsedMax) ? parsedMax : null);
                              const itemCampaignMessages = getCampaignMessagesForProduct(item);
                              const hasGifts = relatedGifts.length > 0;

                              return (
                                <tr key={item.id} className="tf-cart-item" style={hasGifts ? { borderBottom: 'none' } : {}}>
                                  <td className="tf-cart-item_product" style={hasGifts ? { borderBottom: 'none' } : {}}>
                                    <Link href={`/magaza/${categorySlug}/${item.slug}`} className="img-box">
                                      <Image alt={item.name} src={item.image || "/images/default-product.jpg"} width={668} height={932} />
                                    </Link>
                                    <div className="cart-info">
                                      <Link href={`/magaza/${categorySlug}/${item.slug}`} className="cart-title link" style={{ fontWeight: 'bold' }}>{item.name}</Link>
                                      {/* Kampanya mesajlarÄ± */}
                                      {itemCampaignMessages.length > 0 && (
                                        <div style={{ marginTop: '5px' }}>
                                          {itemCampaignMessages.map(({ campaign, message, isNextTier }, idx) => (
                                            <div key={`product-campaign-${campaign.id || idx}`} style={{ fontSize: '11px', color: isNextTier ? '#dc3545' : '#0bc15c', lineHeight: '1.4', backgroundColor: isNextTier ? 'rgba(220, 53, 69, 0.1)' : 'rgba(11, 193, 92, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginRight: '5px', marginBottom: '2px' }}>
                                              {message}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_price" cart-data-title="Fiyat" style={hasGifts ? { borderBottom: 'none' } : {}}>
                                    <div className="cart-price">
                                      {item.discount_price != null && item.discount_price > 0 && item.discount_price < item.price ? (
                                        <>
                                          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>{item.price.toLocaleString("tr-TR")} TL</span>
                                          <span style={{ color: '#0bc15c', fontWeight: '600' }}>{item.discount_price.toLocaleString("tr-TR")} TL</span>
                                        </>
                                      ) : (
                                        <span>{item.price.toLocaleString("tr-TR")} TL</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_quantity" cart-data-title="Miktar" style={hasGifts ? { borderBottom: 'none' } : {}}>
                                    <div className="cart-quantity">
                                      <Quantity isLoading={loadingQuantityFor === item.id} setQuantity={(qty) => setItemQuantity(item.id, qty)} initialValue={item.quantity} minQuantity={minQty} maxQuantity={maxQty} />
                                      {item.applied_campaign_ids?.length > 0 && applied_campaigns && (
                                        <div style={{ marginTop: '8px' }}>
                                          {item.applied_campaign_ids.map((campaignId) => {
                                            const campaign = applied_campaigns.find(c => c.id === campaignId);
                                            if (!campaign || !(campaign.type === 'x_urun_y_tl' || campaign.type === 'x_alana_y_hediye')) return null;
                                            return <div key={campaignId} style={{ fontSize: '11px', color: '#10b981', fontWeight: '500', marginTop: '4px', padding: '4px 8px', backgroundColor: '#f0fdf4', borderRadius: '4px', display: 'inline-block' }}>{campaign.name} </div>;
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_total" cart-data-title="Toplam" style={hasGifts ? { borderBottom: 'none' } : {}}>
                                    <div className="cart-total" style={{ minWidth: "60px" }}>{itemTotal.toLocaleString("tr-TR")} TL</div>
                                  </td>
                                  <td className="tf-cart-item_remove" cart-data-title="" style={hasGifts ? { borderBottom: 'none' } : {}}>
                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="remove-cart btn p-0 border-0 bg-transparent" style={{ color: "#dc3545", cursor: "pointer" }} title="ÃœrÃ¼nÃ¼ kaldÄ±r" aria-label="ÃœrÃ¼nÃ¼ kaldÄ±r">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        <path d="M10 11v6" /><path d="M14 11v6" />
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })()}
                            {/* Linked Gifts Rendering */}
                            {relatedGifts.map((giftItem, giftIndex) => {
                              const categorySlug = giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                              const productSlug = giftItem.slug || giftItem.id;
                              const giftSourceNames = (giftItem.applied_campaign_ids && applied_campaigns
                                ? giftItem.applied_campaign_ids
                                  .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                                  .filter(Boolean)
                                : []
                              );
                              const giftCampaign = resolveGiftCampaign(giftItem);
                              const isLastGift = giftIndex === relatedGifts.length - 1;

                              return (
                                <tr key={`gift-${giftItem.id}-${giftIndex}`} className="tf-cart-item" style={{ backgroundColor: '#f9f9f9', borderTop: 'none' }}>
                                  <td className="tf-cart-item_product" style={{ borderTop: 'none', borderBottomLeftRadius: isLastGift ? '12px' : '0', paddingTop: '10px', paddingBottom: '10px' }}>
                                    <div className="img-box" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px' }}>
                                        <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="#3c81b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                    <div className="cart-info">
                                      <div className="cart-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                        {giftItem.name} <span style={{ color: '#3c81b5' }}>x{giftItem.quantity}</span>
                                      </div>
                                      {giftSourceNames.length > 0 ? (
                                        <div style={{ fontSize: '12px', color: '#10b981' }}>
                                          {giftSourceNames.join(", ")}
                                        </div>
                                      ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                        <div style={{ fontSize: '12px', color: '#10b981' }}>
                                          {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet Tutarına Özel Hediye
                                        </div>
                                      ) : (
                                        <div style={{ fontSize: '12px', color: '#10b981' }}>Hediye Ürün</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_price" cart-data-title="Fiyat" style={{ borderTop: 'none', paddingTop: '10px', paddingBottom: '10px' }}></td>
                                  <td className="tf-cart-item_quantity" cart-data-title="Miktar" style={{ borderTop: 'none', paddingTop: '10px', paddingBottom: '10px' }}>
                                    <div className="cart-quantity">x{giftItem.quantity}</div>
                                  </td>
                                  <td className="tf-cart-item_total" cart-data-title="Toplam" style={{ borderTop: 'none', paddingTop: '10px', paddingBottom: '10px' }}>
                                    <div className="cart-total" style={{ color: '#10b981' }}>Hediye</div>
                                  </td>
                                  <td className="tf-cart-item_remove" cart-data-title="" style={{ borderTop: 'none', borderBottomRightRadius: isLastGift ? '12px' : '0', paddingTop: '10px', paddingBottom: '10px' }} />
                                </tr>
                              );
                            })}

{/* Unlinked Gifts Rendering */}
                        {unlinkedGifts.map((giftItem, giftIndex) => {
                          const categorySlug = giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                          const productSlug = giftItem.slug || giftItem.id;
                          const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                          const giftSourceNames = (giftItem.applied_campaign_ids && applied_campaigns
                            ? giftItem.applied_campaign_ids
                              .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                              .filter(Boolean)
                            : []
                          );
                          const giftCampaign = resolveGiftCampaign(giftItem);

                          return (
                            <tr key={`gift-unlinked-${giftItem.id}-${giftIndex}`} className="tf-cart-item" style={{ backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                              <td className="tf-cart-item_product" style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', paddingTop: '10px', paddingBottom: '10px' }}>
                                <div className="img-box" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px' }}>
                                    <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="#3c81b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="cart-info">
                                  <div className="cart-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                    {giftItem.name} <span style={{ color: '#3c81b5' }}>x{giftItem.quantity}</span>
                                  </div>
                                  {giftSourceNames.length > 0 ? (
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>
                                      {giftSourceNames.join(", ")}
                                    </div>
                                  ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>
                                      {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet TutarÄ±na Ã–zel Ä°ndirim
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>Kampanya Hediyesi</div>
                                  )}
                                </div>
                              </td>
                              <td className="tf-cart-item_price" cart-data-title="Fiyat" style={{ paddingTop: '10px', paddingBottom: '10px' }}></td>
                              <td className="tf-cart-item_quantity" cart-data-title="Miktar" style={{ paddingTop: '10px', paddingBottom: '10px' }}><div className="cart-quantity">x{giftItem.quantity}</div></td>
                              <td className="tf-cart-item_total" cart-data-title="Toplam" style={{ paddingTop: '10px', paddingBottom: '10px' }}><div className="cart-total" style={{ color: '#10b981' }}>Hediye</div></td>
                              <td className="tf-cart-item_remove" cart-data-title="" style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px', paddingTop: '10px', paddingBottom: '10px' }} />
                            </tr>
                          );
                        })}

                        {/* Tier Gifts Rendering */}
                        {tierGifts.map((giftItem, giftIndex) => {
                          const categorySlug = giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                          const productSlug = giftItem.slug || giftItem.id;
                          const productUrl = `/magaza/${categorySlug}/${productSlug}`;
                          const giftSourceNames = (giftItem.applied_campaign_ids && applied_campaigns
                            ? giftItem.applied_campaign_ids
                              .map((cid) => applied_campaigns.find((c) => c.id === cid)?.name)
                              .filter(Boolean)
                            : []
                          );
                          const giftCampaign = resolveGiftCampaign(giftItem);

                          return (
                            <tr key={`gift-tier-${giftItem.id}-${giftIndex}`} className="tf-cart-item" style={{ backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                              <td className="tf-cart-item_product" style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', paddingTop: '10px', paddingBottom: '10px' }}>
                                <div className="img-box" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px' }}>
                                    <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="#3c81b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="cart-info">
                                  <div className="cart-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                    {giftItem.name} <span style={{ color: '#3c81b5' }}>x{giftItem.quantity}</span>
                                  </div>
                                  {giftSourceNames.length > 0 ? (
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>
                                      {giftSourceNames.join(", ")}
                                    </div>
                                  ) : giftCampaign?.applied_tier?.min_cart_amount ? (
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>
                                      {Number(giftCampaign.applied_tier.min_cart_amount).toLocaleString("tr-TR")} Sepet TutarÄ±na Ã–zel Hediye
                                    </div>
                                  ) : null}
                                </div>
                              </td>
                              <td className="tf-cart-item_price" cart-data-title="Fiyat" style={{ paddingTop: '10px', paddingBottom: '10px' }}></td>
                              <td className="tf-cart-item_quantity" cart-data-title="Miktar" style={{ paddingTop: '10px', paddingBottom: '10px' }}><div className="cart-quantity">x{giftItem.quantity}</div></td>
                              <td className="tf-cart-item_total" cart-data-title="Toplam" style={{ paddingTop: '10px', paddingBottom: '10px' }}><div className="cart-total" style={{ color: '#10b981' }}>Hediye</div></td>
                              <td className="tf-cart-item_remove" cart-data-title="" style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px', paddingTop: '10px', paddingBottom: '10px' }} />
                            </tr>
                          );
                        })}
                      </>
                    );
                  })()}
                </tbody>
              </table>

              {!items.length && (
                <div className="text-center py-5">
                  <h5 className="mb_24">Sepetiniz boÅŸ</h5>
                  <Link href="/magaza" className="tf-btn btn-fill animate-hover-btn radius-4">AlÄ±ÅŸveriÅŸe BaÅŸla</Link>
                </div>
              )}
            </form>
          </div>

          {items.length > 0 && (
            <OrderSummary
              items={items}
              cartTotals={cartTotals}
              onSubmitOrder={handleCheckoutRedirect}
              buttonText="SipariÅŸi Tamamla"
              showNotes={false}
              showAgreements={false}
              showProductList={false}
              title="Sepet Ã–zeti"
            />
          )}
        </div>
      </div>
    </section>
  );
}



