"use client";
import { useCartStore } from "@/stores/cartStore";
import { products1 } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import { log } from "@/utils/logger";
import CartRecommendations from "./CartRecommendations";

const ORDER_NOTE_KEY = "cart_order_note";

export default function ShopCart() {
  const { items, updateQuantity, removeItem } = useCartStore();

  // API'den gelen totals değerlerini ayrı selector'la al (infinite loop'u önlemek için)
  const totals = useCartStore((state) => state.totals);

  // Totals hesaplamasını useMemo ile memoize et
  const cartTotals = useMemo(() => {
    if (totals && totals.total !== null && totals.total !== undefined) {
      // API'den gelen totals kullan
      return {
        subtotal: totals.subtotal || 0,
        discount: totals.discountAmount || 0,
        total: totals.total || 0,
      };
    }
    // Fallback: local hesaplama (API'den totals gelmemişse)
    const subtotal = items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);

    const discountedTotal = items.reduce((total, item) => {
      const itemPrice = item.discount_price || item.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);

    const discount = subtotal - discountedTotal;

    return {
      subtotal: subtotal,
      discount: discount > 0 ? discount : 0,
      total: discountedTotal,
    };
  }, [totals, items]);

  const setQuantity = async (id, quantity) => {
    if (quantity >= 1) {
      try {
        await updateQuantity(id, quantity);
      } catch (error) {
        console.error("Miktar güncelleme hatası:", error);
      }
    }
  };

  return (
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <div className="title fw-5">Sepet</div>
            <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
          </div>
          <div className="wrap">
            <CartRecommendations products={items} maxItems={10} />
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {items.map((item, i) => {
                      // Kategori slug'ını al
                      const categorySlug =
                        item.product?.categories?.[0]?.slug || item.product?.primary_category?.slug || "urunler";
                      const productSlug = item.slug || item.id;
                      const productUrl = `/magaza/${categorySlug}/${productSlug}`;

                      // Görsel URL'i al
                      const imageUrl =
                        item.image ||
                        item.product?.cover_image?.url ||
                        item.product?.images?.[0] ||
                        "/images/placeholder.jpg";

                      // Fiyat hesapla (indirimli fiyat varsa onu kullan)
                      const itemPrice = item.discount_price || item.price || 0;

                      return (
                      <div key={i} className="tf-mini-cart-item">
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
                            <div className="price fw-6">₺{itemPrice.toLocaleString("tr-TR")}</div>
                          <div className="tf-mini-cart-btns">
                            <div className="wg-quantity small">
                              <span
                                className="btn-quantity minus-btn"
                                  onClick={() => setQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </span>
                              <input
                                type="text"
                                name="number"
                                  value={item.quantity}
                                min={1}
                                  onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                              />
                              <span
                                className="btn-quantity plus-btn"
                                  onClick={() => setQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </span>
                            </div>
                            <div
                              className="tf-mini-cart-remove"
                              style={{ cursor: "pointer" }}
                                onClick={async () => {
                                  try {
                                    await removeItem(item.id);
                                  } catch (error) {
                                    console.error("Sepetten çıkarma hatası:", error);
                                  }
                                }}
                            >
                              Kaldır
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}

                    {!items.length && (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-5">
                          <div className="col-12 fs-18">Sepetiniz boş</div>
                          <div className="col-12 mt-3">
                            <Link
                              href={`/magaza`}
                              className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                              style={{ width: "fit-content" }}
                            >
                              Ürünleri Keşfet!
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="tf-mini-cart-bottom">
                <div className="tf-mini-cart-tool"></div>
                <div className="tf-mini-cart-bottom-wrap">
                  <div className="tf-cart-totals-discounts">
                    <div className="tf-cart-totals-item tf-cart-totals-item-small">
                      <div className="tf-cart-total-label">Ara Toplam</div>
                      <div className="tf-cart-total-value">₺{cartTotals.subtotal.toLocaleString("tr-TR")}</div>
                  </div>
                    <div className="tf-cart-totals-item tf-cart-totals-item-small">
                      <div className="tf-cart-total-label">İndirim</div>
                      <div className="tf-cart-total-value">
                        {cartTotals.discount > 0 ? `-₺${cartTotals.discount.toLocaleString("tr-TR")}` : "₺0"}
                  </div>
                </div>
                    <div className="tf-cart-totals-item tf-cart-totals-item-total">
                      <div className="tf-cart-total-label fw-6">Toplam</div>
                      <div className="tf-cart-total-value fw-6">₺{cartTotals.total.toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                  
                  <div className="tf-mini-cart-line" />

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
