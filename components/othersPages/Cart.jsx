"use client";
import React, { useMemo } from "react";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { calculateCartTotals } from "@/utils/cartTotals";
import Quantity from "@/components/shopDetails/Quantity";
import OrderSummary from "@/components/othersPages/checkout/OrderSummary";
import { useRouter } from "next/navigation";

export default function Cart() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const applied_campaigns = useCartStore((state) => state.applied_campaigns);
  const totals = useCartStore((state) => state.totals);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isClearingCart, setIsClearingCart] = React.useState(false);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  // Totals hesaplamasını useMemo ile memoize et
  const cartTotals = useMemo(() => {
    return calculateCartTotals(totals, items);
  }, [totals, items]);

  const handleCheckoutRedirect = () => {
    router.push("/odeme");
  };

  const handleClearCart = () => {
    if (isClearingCart || items.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    setShowClearConfirm(false);
    setIsClearingCart(true);
    try {
      await clearCart();
    } catch (error) {
      console.error("Sepet temizleme hatası:", error);
    } finally {
      setIsClearingCart(false);
    }
  };

  const setItemQuantity = async (id, quantity) => {
    if (quantity >= 1) {
      try {
        await updateQuantity(id, quantity);
      } catch (error) {
        console.error("Miktar güncelleme hatası:", error);
      }
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error("Ürün kaldırma hatası:", error);
    }
  };

  return (
    <section className="flat-spacing-11">
      {/* Onay Dialogu */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            width: '90%', maxWidth: '320px', backgroundColor: '#fff',
            borderRadius: '16px', padding: '30px 25px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.2s ease-out'
          }}>
            <style>{`@keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
            <div style={{ fontSize: '18px', marginBottom: '10px', color: '#333', fontWeight: '700' }}>Sepeti Boşalt?</div>
            <div style={{ fontSize: '14px', marginBottom: '25px', color: '#666', lineHeight: '1.5' }}>Sepetinizdeki tüm ürünleri silmek istediğinize emin misiniz?</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={confirmClearCart} style={{ flex: 1, padding: '12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Evet, Sil</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f5f5f5', color: '#333', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="tf-cart-countdown">
          <div className="title-left">
            <svg className="d-inline-block" xmlns="http://www.w3.org/2000/svg" width={16} height={24} viewBox="0 0 16 24" fill="rgb(219 18 21)">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.0899 24C11.3119 22.1928 11.4245 20.2409 10.4277 18.1443C10.1505 19.2691 9.64344 19.9518 8.90645 20.1924C9.59084 18.2379 9.01896 16.1263 7.19079 13.8576C7.15133 16.2007 6.58824 17.9076 5.50148 18.9782C4.00436 20.4517 4.02197 22.1146 5.55428 23.9669C-0.806588 20.5819 -1.70399 16.0418 2.86196 10.347C3.14516 11.7228 3.83141 12.5674 4.92082 12.8809C3.73335 7.84186 4.98274 3.54821 8.66895 0C8.6916 7.87426 11.1062 8.57414 14.1592 12.089C17.4554 16.3071 15.5184 21.1748 10.0899 24Z" />
            </svg>
            <p>Bu ürünler sınırlıdır, hemen sipariş veriniz!</p>
          </div>
          <div className="js-countdown timer-count" data-timer={600} data-labels="d:,h:,m:,s" />
        </div>

        <div className="tf-page-cart-wrap">
          <div className="tf-page-cart-item">
            <div className="d-flex justify-content-between align-items-center mb_20">
              <h5 className="fw-5">Sepetteki Ürünler</h5>
              {items.length > 0 && (
                <button onClick={handleClearCart} disabled={isClearingCart} className="text_primary fw-6 bg-transparent border-0 underline" style={{ fontSize: '14px', cursor: isClearingCart ? 'not-allowed' : 'pointer' }}>
                  {isClearingCart ? 'Temizleniyor...' : 'Sepeti Boşalt'}
                </button>
              )}
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <table className="tf-table-page-cart">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Fiyat</th>
                    <th>Miktar</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const normalItems = items.filter(item => !item.is_gift);
                    const giftItems = items.filter(item => item.is_gift);
                    const linkedGiftIds = new Set();
                    const groupedItems = normalItems.map(normalItem => {
                      const relatedGifts = giftItems.filter((giftItem) => {
                        const hasLink = Array.isArray(giftItem.source_product_ids) && giftItem.source_product_ids.includes(normalItem.productId);
                        if (hasLink && !linkedGiftIds.has(giftItem.id)) {
                          linkedGiftIds.add(giftItem.id);
                          return true;
                        }
                        return false;
                      });
                      return { normalItem, giftItems: relatedGifts };
                    });
                    const unlinkedGifts = giftItems.filter((giftItem) => !linkedGiftIds.has(giftItem.id));

                    return (
                      <>
                        {groupedItems.map(({ normalItem, giftItems: relatedGifts }, groupIndex) => (
                          <React.Fragment key={normalItem.id || groupIndex}>
                            {(() => {
                              const item = normalItem;
                              const itemPrice = item.discount_price || item.price || 0;
                              const itemTotal = itemPrice * item.quantity;
                              const categorySlug = item.product?.categories?.[0]?.slug || item.product?.primary_category?.slug || "urunler";
                              const rawMax = item.max_purchase_quantity ?? item.product?.max_purchase_quantity ?? item.product?.max_quantity ?? null;
                              const parsedMax = rawMax === null || rawMax === undefined ? null : Number(rawMax);
                              const maxQty = parsedMax === 0 ? 999 : (Number.isFinite(parsedMax) ? parsedMax : null);

                              return (
                                <tr key={item.id} className="tf-cart-item">
                                    <td className="tf-cart-item_product">
                                      <Link href={`/magaza/${categorySlug}/${item.slug}`} className="img-box">
                                        <Image alt={item.name} src={item.image || "/images/default-product.jpg"} width={668} height={932} />
                                      </Link>
                                    <div className="cart-info">
                                      <Link href={`/magaza/${categorySlug}/${item.slug}`} className="cart-title link" style={{ fontWeight: 'bold' }}>{item.name}</Link>
                                      <span className="remove-cart link remove" onClick={() => handleRemoveItem(item.id)} style={{ color: '#dc3545', cursor: 'pointer' }} title="Kaldır">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 5 6 21 6" />
                                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                          <path d="M10 11v6" /><path d="M14 11v6" />
                                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                      </span>
                                    </div>
                                    </td>
                                  <td className="tf-cart-item_price" cart-data-title="Fiyat">
                                    <div className="cart-price">
                                      {item.discount_price != null && item.discount_price > 0 && item.discount_price < item.price ? (
                                        <>
                                          <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>₺{item.price.toLocaleString("tr-TR")}</span>
                                          <span style={{ color: '#0bc15c', fontWeight: '600' }}>₺{item.discount_price.toLocaleString("tr-TR")}</span>
                                        </>
                                      ) : (
                                        <span>₺{item.price.toLocaleString("tr-TR")}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_quantity" cart-data-title="Miktar">
                                    <div className="cart-quantity">
                                      <Quantity setQuantity={(qty) => setItemQuantity(item.id, qty)} initialValue={item.quantity} minQuantity={1} maxQuantity={maxQty} />
                                      {item.applied_campaign_ids?.length > 0 && applied_campaigns && (
                                        <div style={{ marginTop: '8px' }}>
                                          {item.applied_campaign_ids.map((campaignId) => {
                                            const campaign = applied_campaigns.find(c => c.id === campaignId);
                                            if (!campaign || !(campaign.type === 'x_urun_y_tl' || campaign.type === 'x_alana_y_hediye')) return null;
                                            return <div key={campaignId} style={{ fontSize: '11px', color: '#10b981', fontWeight: '500', marginTop: '4px', padding: '4px 8px', backgroundColor: '#f0fdf4', borderRadius: '4px', display: 'inline-block' }}>{campaign.name} uygulandı</div>;
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_total" cart-data-title="Toplam">
                                    <div className="cart-total" style={{ minWidth: "60px" }}>₺{itemTotal.toLocaleString("tr-TR")}</div>
                                  </td>
                                </tr>
                              );
                            })()}
                            {relatedGifts.map((giftItem, giftIndex) => {
                              const categorySlug = giftItem.product?.categories?.[0]?.slug || giftItem.product?.primary_category?.slug || "urunler";
                              return (
                                <tr key={`gift-${giftItem.id}-${giftIndex}`} className="tf-cart-item" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                                  <td className="tf-cart-item_product">
                                    <Link href={`/magaza/${categorySlug}/${giftItem.slug}`} className="img-box"><Image alt={giftItem.name} src={giftItem.image || "/images/default-product.jpg"} width={668} height={932} /></Link>
                                    <div className="cart-info">
                                      <div className="cart-title" style={{ fontSize: '14px', fontWeight: '500' }}>{giftItem.name} x{giftItem.quantity}</div>
                                      <div style={{ fontSize: '12px', color: '#10b981' }}>Hediye Ürün</div>
                                    </div>
                                  </td>
                                  <td className="tf-cart-item_price" cart-data-title="Fiyat"><div className="cart-price" style={{ color: '#10b981' }}>Bedelsiz</div></td>
                                  <td className="tf-cart-item_quantity" cart-data-title="Miktar"><div className="cart-quantity">x{giftItem.quantity}</div></td>
                                  <td className="tf-cart-item_total" cart-data-title="Toplam"><div className="cart-total" style={{ color: '#10b981' }}>Hediye</div></td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                        {unlinkedGifts.map((giftItem, giftIndex) => (
                          <tr key={`gift-unlinked-${giftItem.id}-${giftIndex}`} className="tf-cart-item" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                            <td className="tf-cart-item_product">
                              <div className="cart-info" style={{ paddingLeft: '80px' }}>
                                <div className="cart-title" style={{ fontSize: '14px', fontWeight: '500' }}>{giftItem.name} x{giftItem.quantity}</div>
                                <div style={{ fontSize: '12px', color: '#10b981' }}>Kampanya Hediyesi</div>
                              </div>
                            </td>
                            <td className="tf-cart-item_price" cart-data-title="Fiyat"><div className="cart-price" style={{ color: '#10b981' }}>Bedelsiz</div></td>
                            <td className="tf-cart-item_quantity" cart-data-title="Miktar"><div className="cart-quantity">x{giftItem.quantity}</div></td>
                            <td className="tf-cart-item_total" cart-data-title="Toplam"><div className="cart-total" style={{ color: '#10b981' }}>Hediye</div></td>
                          </tr>
                        ))}
                      </>
                    );
                  })()}
                </tbody>
              </table>

              {!items.length && (
                <div className="text-center py-5">
                  <h5 className="mb_24">Sepetiniz boş</h5>
                  <Link href="/magaza" className="tf-btn btn-fill animate-hover-btn radius-4">Alışverişe Başla</Link>
                </div>
              )}
            </form>
          </div>

          {items.length > 0 && (
            <OrderSummary
              items={items}
              cartTotals={cartTotals}
              onSubmitOrder={handleCheckoutRedirect}
              buttonText="Siparişi Tamamla"
              showNotes={false}
              showAgreements={false}
              showProductList={false}
              title="Sepet Özeti"
            />
          )}
        </div>
      </div>
    </section>
  );
}
