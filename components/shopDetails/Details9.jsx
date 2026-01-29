"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Slider5 from "./sliders/Slider5";
import { openCartModal } from "@/utils/openCartModal";
import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import { colors, paymentImages, sizeOptions } from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import { useContextElement } from "@/context/Context";
import { useCartStore } from "@/stores/cartStore";
export default function Details9({ product }) {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const { addItem } = useCartStore();
  const cartItems = useCartStore((s) => s.items);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Trendyol tarzı animasyonlu mesajlar
  const announcementMessages = useMemo(() => {
    const messages = [
      "Geç kalma! 56 kişi bu ürünü sepetine ekledi.",
      "Son 24 saatte 120 kişi bu ürünü satın aldı.",
      "Stokta sadece 5 adet kaldı!",
      "Bu ürünü 340 kişi beğendi.",
      "Hızlı kargo ile 1-2 gün içinde kapında!",
    ];
    return messages;
  }, []);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (announcementMessages.length <= 1) return;

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
  }, [announcementMessages.length]);

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

  const [currentVariation, setCurrentVariation] = useState(hasVariations ? allVariations[0] : null);

  useEffect(() => {
    if (hasVariations && allVariations.length > 0) setCurrentVariation(allVariations[0]);
    else setCurrentVariation(null);
  }, [hasVariations, allVariations]);

  // Min/Max: API ne veriyorsa onu uygula (min=min, max=max). max < min gelirse max=min.
  const minQuantity = Number.isFinite(product?.min_purchase_quantity) ? Number(product.min_purchase_quantity) : 1;
  const rawMax =
    product?.max_purchase_quantity === null || product?.max_purchase_quantity === undefined
      ? null
      : Number(product.max_purchase_quantity);
  const normalizedMax =
    rawMax === 0 ? 999 : (rawMax === null || Number.isNaN(rawMax) ? null : rawMax);
  const maxQuantity = normalizedMax === null ? null : Math.max(normalizedMax, minQuantity);
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

  const {
    addProductToCart,
    isAddedToCartProducts,
    addToCompareItem,
    isAddedtoCompareItem,
    addToWishlist,
    isAddedtoWishlist,
  } = useContextElement();

  const handleAddToCartAnimated = async () => {
    if (isAdding || showSuccess) return;

    // Anasayfadaki gibi: her tık +1 (ilk eklemede min > 1 ise min kadar ekle)
    const currentQtyInCart = existingCartItem?.quantity || 0;
    const increment = currentQtyInCart === 0 ? Math.max(1, minQuantity) : 1;
    const nextQty = currentQtyInCart + increment;

    if (maxQuantity !== null && maxQuantity !== undefined && nextQty > maxQuantity) {
      alert(`Maksimum sipariş miktarı ${maxQuantity} adettir.`);
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product, increment, false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <section className="flat-spacing-4 pt_0" style={{ maxWidth: "100vw", overflow: "clip" }}>
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
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
                  <div className="tf-product-info-badges">
                    <div className="product-status-content">
                      <i className="icon-lightning" />
                      <div className="announcement-messages-wrapper">
                        {announcementMessages.map((message, idx) => {
                          const isActive = idx === currentMessageIndex;
                          const isNext = idx === (currentMessageIndex + 1) % announcementMessages.length;
                          const isAnimatingOut = isActive && isAnimating;
                          return (
                            <p
                              key={idx}
                              className={`fw-6 announcement-message ${isActive ? "active" : ""} ${isNext && isAnimating ? "next" : ""} ${isAnimatingOut ? "animating-out" : ""}`}
                            >
                              {message}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="tf-product-info-price">
                    <div className="price-on-sale">₺{finalPrice.toLocaleString("tr-TR")}</div>
                    {originalPrice && originalPrice > finalPrice && (
                      <div className="compare-at-price">₺{originalPrice.toLocaleString("tr-TR")}</div>
                    )}
                    {(timeBasedDiscount || product.discount_price) && originalPrice && (
                      <div className="badges-on-sale">
                        <span>
                          {timeBasedDiscount
                            ? timeBasedDiscount.discount_value
                            : Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}
                        </span>
                        % İNDİRİM
                      </div>
                    )}
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
                  {hasVariations && (
                    <div className="tf-product-info-variant-picker">
                      <div className="variant-picker-item"></div>
                      <div className="variant-picker-item">
                        <form className="variant-picker-values">
                          {allVariations.map((variation, idx) => {
                            const inputId = `variation-${idx}`;
                            const isActive =
                              currentVariation &&
                              (currentVariation.slug === variation.slug || currentVariation.name === variation.name);
                            const variationUrl = `/magaza/${variation.category_slug || "urunler"}/${variation.slug || ""
                              }`;
                            return (
                              <React.Fragment key={variation.slug || variation.name || idx}>
                                <input type="radio" name="variation" id={inputId} readOnly checked={isActive} />
                                <label
                                  onClick={() => {
                                    if (!isActive) setCurrentVariation(variation);
                                  }}
                                  className="style-text"
                                  htmlFor={inputId}
                                  data-value={variation.slug || variation.name}
                                >
                                  <p>
                                    <Link href={variationUrl}>{variation.name}</Link>
                                  </p>
                                </label>
                              </React.Fragment>
                            );
                          })}
                        </form>
                      </div>
                    </div>
                  )}
                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()} className="">
                      <div className="tf-product-buy-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="tf-product-info-quantity" style={{ margin: 0 }}>
                          <Quantity setQuantity={setQuantity} minQuantity={minQuantity} maxQuantity={maxQuantity} />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddToCartAnimated}
                          disabled={isAdding || showSuccess}
                          className={`main-cart-btn ${showSuccess ? "success-animation" : ""}`}
                        >
                          <span className="button-text-main">
                            {showSuccess ? "Sepete Eklendi" : isAdding ? "Ekleniyor..." : "Sepete Ekle"}
                          </span>
                          {showSuccess && <span className="button-text-slide">Sepete Eklendi</span>}
                        </button>

                      </div>

                      {/* <div className="w-100">
                        <a href="#" className="btns-full">
                          Satın al{" "}
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

                    /* Varyasyon butonları: arkaplan beyaz, yazı siyah, gölge yok */
                    .tf-product-info-variant-picker .variant-picker-values .style-text {
                      background: #fff !important;
                      color: #000 !important;
                      border: 1px solid #e5e7eb !important;
                      box-shadow: none !important;
                    }
                    /* Sadece seçili OLMAYAN varyasyonlarda hover border yansın */
                    .tf-product-info-variant-picker
                      .variant-picker-values
                      input[type="radio"]:not(:checked)
                      + .style-text:hover {
                      border-color: #111 !important;
                    }
                    .tf-product-info-variant-picker .variant-picker-values .style-text p,
                    .tf-product-info-variant-picker .variant-picker-values .style-text a {
                      color: #000 !important;
                    }
                    /* Seçili varyasyon: hafif soluk, tıklanamaz, hover efekti yok */
                    .tf-product-info-variant-picker
                      .variant-picker-values
                      input[type="radio"]:checked
                      + .style-text {
                      opacity: 0.7;
                      box-shadow: none !important;
                      pointer-events: none;
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

                    .main-cart-btn {
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
                      width: auto;
                      min-width: 200px;
                      max-width: 250px;
                    }

                    @media (max-width: 768px) {
                      .main-cart-btn {
                        flex: 1;
                        min-width: 0;
                        max-width: none;
                        width: 100%;
                      }
                    }

                    .main-cart-btn:disabled {
                      opacity: 1 !important;
                      cursor: not-allowed;
                    }

                    .main-cart-btn .button-text-main,
                    .main-cart-btn .button-text-slide {
                      width: 100%;
                      text-align: center;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    }

                    .main-cart-btn.success-animation {
                      background: #10b981;
                      border-color: #10b981;
                      overflow: hidden;
                    }

                    .main-cart-btn.success-animation .button-text-main {
                      opacity: 0;
                      transform: translateY(100%);
                      transition: opacity 0.2s, transform 0.2s;
                    }

                    .main-cart-btn.success-animation .button-text-slide {
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
                    <a href="#ask_question" data-bs-toggle="modal" className="tf-product-extra-icon">
                      <div className="icon">
                        <i className="icon-question" />
                      </div>
                      <div className="text fw-6">Soru sor</div>
                    </a>
                    <a href="#delivery_return" data-bs-toggle="modal" className="tf-product-extra-icon">
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
                    </a>
                    <a href="#share_social" data-bs-toggle="modal" className="tf-product-extra-icon">
                      <div className="icon">
                        <i className="icon-share" />
                      </div>
                      <div className="text fw-6">Paylaş</div>
                    </a>
                  </div>
                  {/* <div className="tf-product-info-delivery-return">
                    <div className="row">
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery">
                          <div className="icon">
                            <i className="icon-delivery-time" />
                          </div>
                          <p>
                            Teslimat süresi: <span className="fw-7">3-6 gün</span>
                          </p>
                        </div>
                      </div>
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery mb-0">
                          <div className="icon">
                            <i className="icon-return-order" />
                          </div>
                          <p>
                            <span className="fw-7">2</span> yıl garanti ve <span className="fw-7">48</span> saatte
                            Teknik Servis Garantisi
                          </p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <div className="tf-product-info-trust-seal">
                    <div className="tf-product-trust-mess">
                      <i className="icon-safe" />
                      <p className="fw-6">
                        Güvenli <br /> Ödeme
                      </p>
                    </div>
                    <div className="tf-payment">
                      {paymentImages.map((image, index) => (
                        <Image key={index} alt={image.alt} src={image.src} width={image.width} height={image.height} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StickyItem />
    </section>
  );
}
