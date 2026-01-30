"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

const ORDER_NOTE_KEY = "cart_order_note";

export default function OrderSummary({ items, cartTotals, onSubmitOrder, isSubmitting = false, orderErrors = {}, orderErrorMessage = "", onOrderNoteChange }) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const { applyCoupon, removeCoupon } = useCartStore();
  const coupon = useCartStore((state) => state.coupon);

  // Sayfa yüklendiğinde localStorage'dan sipariş notunu oku
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNote = localStorage.getItem(ORDER_NOTE_KEY);
      if (savedNote) {
        setOrderNote(savedNote);
        setShowOrderNote(true);
        if (onOrderNoteChange) {
          onOrderNoteChange(savedNote);
        }
      }
    }
  }, [onOrderNoteChange]);

  // Sipariş notu değiştiğinde parent component'e bildir ve localStorage'a kaydet
  const handleOrderNoteChange = (value) => {
    setOrderNote(value);
    if (onOrderNoteChange) {
      onOrderNoteChange(value);
    }
    if (typeof window !== "undefined") {
      if (value && value.trim()) {
        localStorage.setItem(ORDER_NOTE_KEY, value);
      } else {
        localStorage.removeItem(ORDER_NOTE_KEY);
      }
    }
  };

  // Checkbox değiştiğinde
  const handleShowOrderNoteChange = (e) => {
    const checked = e.target.checked;
    setShowOrderNote(checked);
    if (!checked) {
      // Checkbox kapatıldığında notu temizle
      handleOrderNoteChange("");
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
  return (
    <div className="tf-page-cart-footer">
      <div className="tf-cart-footer-inner">
        <h5 className="fw-5 mb_20">Sipariş Bilgileri</h5>
        <form onSubmit={(e) => e.preventDefault()} className="tf-page-cart-checkout widget-wrap-checkout">
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
          <div className="d-flex justify-content-between line pb_10">
            <h6 className="fw-5" style={{ fontSize: "14px" }}>
              Ara Toplam
            </h6>
            <h6 className="fw-5" style={{ fontSize: "14px" }}>
              ₺{cartTotals.subtotal.toLocaleString("tr-TR")}
            </h6>
          </div>
          {cartTotals.couponDiscountAmount > 0 && coupon && coupon.code && (
            <div className="d-flex justify-content-between line pb_10">
              <h6 className="fw-5" style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Kupon İndirimi</span>
                {coupon.code && (
                  <span style={{ fontWeight: "600", color: "#333" }}>({coupon.code})</span>
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
          {cartTotals.discount > 0 && cartTotals.couponDiscountAmount === 0 && (
            <div className="d-flex justify-content-between line pb_10">
              <h6 className="fw-5" style={{ fontSize: "14px" }}>
                İndirim
              </h6>
              <h6 className="fw-5" style={{ fontSize: "14px" }}>
                -₺{cartTotals.discount.toLocaleString("tr-TR")}
              </h6>
            </div>
          )}
          <div className="d-flex justify-content-between line pb_20">
            <h6 className="fw-5">Toplam</h6>
            <h6 className="total fw-5">₺{cartTotals.total.toLocaleString("tr-TR")}</h6>
          </div>
          {/* Sipariş Notu - Checkbox ile kontrol edilebilir */}
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e5e5" }}>
            <div className="box-checkbox fieldset-radio mb_20">
              <input 
                type="checkbox" 
                id="show-order-note" 
                className="tf-check" 
                checked={showOrderNote}
                onChange={handleShowOrderNoteChange}
              />
              <label htmlFor="show-order-note" className="text_black-2">
                Sipariş notu eklemek istiyorum (isteğe bağlı)
              </label>
            </div>
            {showOrderNote && (
              <div style={{ marginTop: "10px" }}>
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
          </div>
          <div className="wd-check-payment" style={{ marginTop: "30px", paddingTop: "30px", borderTop: "1px solid #e5e5e5" }}>
            <p className="text_black-2 mb_20">
              Kişisel verileriniz siparişinizi işlemek için kullanılacak, bu web sitesinde deneyiminizi
              desteklemek ve diğer amaçlar için kullanılacaktır.
            </p>
            <div className="box-checkbox fieldset-radio mb_20">
              <input required type="checkbox" id="check-agree" className="tf-check" />
              <label htmlFor="check-agree" className="text_black-2">
                <Link href={`/terms-conditions`}>Şartları ve Koşulları</Link> kabul ediyorum
              </label>
              {orderErrors.terms_accepted && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#dc3545" }}>
                  {orderErrors.terms_accepted[0]}
                </div>
              )}
            </div>
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
            {isSubmitting ? "Gönderiliyor..." : "Sipariş Ver"}
          </button>
        </form>
      </div>
    </div>
  );
}
