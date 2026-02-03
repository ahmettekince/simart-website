"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

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
    console.log("[OrderSummary] Coupon state changed:", coupon);
  }, [coupon]);

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
      setCouponError("Kupon uygulanırken bir hata oluştu.");
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
      }
    } catch (error) {
      setCouponError("Kupon kaldırılırken bir hata oluştu.");
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
                const itemTotal = itemPrice * item.quantity;

                return (
                  <li key={i} className="checkout-product-item">
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
                      </div>
                      <span className="price">₺{itemTotal.toLocaleString("tr-TR")}</span>
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
                  className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  style={{
                    opacity: isApplyingCoupon || !couponCode.trim() ? 0.6 : 1,
                    cursor: isApplyingCoupon || !couponCode.trim() ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    height: "36px",
                    padding: "6px 12px",
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
                  Kupon kodu başarıyla uygulandı!
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
                  ₺{cartTotals.subtotal.toLocaleString("tr-TR")}
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
                  -₺{cartTotals.customDiscountAmount.toLocaleString("tr-TR")}
                </h6>
              </div>
            )}
            {cartTotals.campaignDiscountAmount > 0 && (
              <div className="d-flex justify-content-between">
                <h6 className="fw-5" style={{ fontSize: "14px" }}>
                  Kampanya İndirimi
                </h6>
                <h6 className="fw-5" style={{ fontSize: "14px", color: "#0bc15c" }}>
                  -₺{cartTotals.campaignDiscountAmount.toLocaleString("tr-TR")}
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
                  -₺{cartTotals.couponDiscountAmount.toLocaleString("tr-TR")}
                </h6>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between" style={{ borderTop: "1px solid #e5e5e5", paddingTop: "10px", marginTop: "10px" }}>
            <h6 className="fw-5" style={{ fontSize: "18px" }}>Toplam</h6>
            <h6 className="total fw-5" style={{ fontSize: "18px" }}>₺{cartTotals.total.toLocaleString("tr-TR")}</h6>
          </div>
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
            </>
          )}
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
                    <Link href="/sartlar-ve-kosullar" target="_blank" style={{ textDecoration: "underline" }}>Şartlar ve Koşulları</Link> ve{" "}
                    <Link href="/iade-politikasi" target="_blank" style={{ textDecoration: "underline" }}>İade ve Geri Ödeme Politikasını</Link> okudum, kabul ediyorum.
                  </label>
                </div>
                {orderErrors.agreements_accepted && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#dc3545", width: "100%" }}>
                    {orderErrors.agreements_accepted[0]}
                  </div>
                )}
              </div>
            )}

            {orderErrors.uzak_satis_sozlesmesi_accepted && (
              <div style={{ marginTop: "-15px", marginBottom: "15px", fontSize: "12px", color: "#dc3545" }}>
                {orderErrors.uzak_satis_sozlesmesi_accepted[0]}
              </div>
            )}
            {orderErrorMessage && (
              <div style={{ marginTop: "15px", marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                {orderErrorMessage}
              </div>
            )}
            {orderErrors.delivery_address_id && (
              <div style={{ marginTop: "15px", marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                {orderErrors.delivery_address_id[0]}
              </div>
            )}
            {orderErrors.invoice_address_id && (
              <div style={{ marginTop: "15px", marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                {orderErrors.invoice_address_id[0]}
              </div>
            )}
            {orderErrors.card_holder_name && (
              <div style={{ marginTop: "15px", marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                {orderErrors.card_holder_name[0]}
              </div>
            )}
            {orderErrors.card_number && (
              <div style={{ marginTop: "15px", marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                {orderErrors.card_number[0]}
              </div>
            )}
          </div>
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
