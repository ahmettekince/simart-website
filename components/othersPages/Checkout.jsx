"use client";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { log } from "@/utils/logger";

const ORDER_NOTE_KEY = "cart_order_note";

export default function Checkout() {
  const { items } = useCartStore();

  // API'den gelen totals.total kullan, yoksa local hesapla (fallback)
  const totals = useCartStore((state) => state.totals);

  const cartTotals = useMemo(() => {
    if (totals && totals.total !== null && totals.total !== undefined) {
      return {
        subtotal: totals.subtotal || 0,
        discount: totals.discountAmount || 0,
        total: totals.total || 0,
      };
    }
    // Fallback: local hesaplama
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

  const [orderNote, setOrderNote] = useState("");
  const [sameBillingAddress, setSameBillingAddress] = useState(true); // Default: teslimat ve fatura adresi aynı
  const [invoiceType, setInvoiceType] = useState("individual"); // "individual" veya "corporate"

  // Sayfa yüklendiğinde localStorage'dan sipariş notunu oku
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNote = localStorage.getItem(ORDER_NOTE_KEY);
      if (savedNote) {
        setOrderNote(savedNote);
      }
    }
  }, []);

  // Sipariş notu değiştiğinde localStorage'a kaydet
  const handleOrderNoteChange = (value) => {
    setOrderNote(value);
    if (typeof window !== "undefined") {
      if (value && value.trim()) {
        localStorage.setItem(ORDER_NOTE_KEY, value);
      } else {
        localStorage.removeItem(ORDER_NOTE_KEY);
      }
    }
  };
  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          <div className="tf-page-cart-item">
            <h5 className="fw-5 mb_20">1 - Teslimat Adresi</h5>
            <form onSubmit={(e) => e.preventDefault()} className="form-checkout">
              {/* Teslimat Adresi Formu */}
              <fieldset className="box fieldset">
                <label htmlFor="address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
                <input required type="text" id="address-title" placeholder="Örn: Evim" />
              </fieldset>

              <div className="box grid-2">
                <fieldset className="fieldset">
                  <label htmlFor="first-name">Ad</label>
                  <input required type="text" id="first-name" name="delivery[first_name]" />
                </fieldset>
                <fieldset className="fieldset">
                  <label htmlFor="last-name">Soyad</label>
                  <input required type="text" id="last-name" name="delivery[last_name]" />
                </fieldset>
              </div>

              <fieldset className="box fieldset">
                <label htmlFor="phone">Telefon Numarası</label>
                <input required type="tel" id="phone" name="delivery[phone]" />
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="email">E-Posta Adresi</label>
                <input required type="email" autoComplete="abc@xyz.com" id="email" name="delivery[email]" />
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="city">İl</label>
                <div className="select-custom">
                  <select required className="tf-select w-100" id="city" name="delivery[city]">
                    <option value="">Seçiniz</option>
                    {/* İl listesi buraya eklenecek */}
                  </select>
                </div>
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="district">İlçe</label>
                <div className="select-custom">
                  <select required className="tf-select w-100" id="district" name="delivery[district]">
                    <option value="">Önce il seçiniz</option>
                  </select>
                </div>
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="neighborhood">Mahalle / Semt*</label>
                <div className="select-custom">
                  <select required className="tf-select w-100" id="neighborhood" name="delivery[neighborhood]">
                    <option value="">Önce ilçe seçiniz</option>
                  </select>
                </div>
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="street">Sokak / Cadde</label>
                <div className="select-custom">
                  <select required className="tf-select w-100" id="street" name="delivery[street]">
                    <option value="">Önce mahalle seçiniz</option>
                  </select>
                </div>
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="address-detail">Bina numarası, kapı numarası, bina adı....</label>
                <textarea
                  name="delivery[address_detail]"
                  id="address-detail"
                  rows={4}
                  placeholder="Detaylı adres bilgisi"
                />
              </fieldset>

              {/* Fatura Türü */}
              <fieldset className="box fieldset">
                <label className="mb_15">Fatura Türü*</label>
                <div className="d-flex gap-20">
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name="invoice_type"
                      id="invoice-individual"
                      value="individual"
                      checked={invoiceType === "individual"}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      style={{ margin: 0, verticalAlign: "middle" }}
                    />
                    <label htmlFor="invoice-individual" style={{ margin: 0, lineHeight: "1.5" }}>
                      Bireysel
                    </label>
                  </div>
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name="invoice_type"
                      id="invoice-corporate"
                      value="corporate"
                      checked={invoiceType === "corporate"}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      style={{ margin: 0, verticalAlign: "middle" }}
                    />
                    <label htmlFor="invoice-corporate" style={{ margin: 0, lineHeight: "1.5" }}>
                      Kurumsal
                    </label>
                  </div>
                </div>
              </fieldset>

              {invoiceType === "individual" && (
                <fieldset className="box fieldset">
                  <label htmlFor="tc-identity">T.C. Kimlik Numaranız*</label>
                  <input required type="text" id="tc-identity" name="tc_identity" maxLength={11} pattern="[0-9]{11}" />
                </fieldset>
              )}

              {invoiceType === "corporate" && (
                <>
                  <fieldset className="box fieldset">
                    <label htmlFor="company-name">Firma Adı</label>
                    <input required type="text" id="company-name" name="company_name" placeholder="Firma Adı" />
                  </fieldset>
                  <fieldset className="box fieldset">
                    <label htmlFor="tax-number">Vergi Numaranız</label>
                    <input required type="text" id="tax-number" name="tax_number" placeholder="Vergi Numaranız" />
                  </fieldset>
                  <fieldset className="box fieldset">
                    <label htmlFor="tax-office">Vergi Dairesi Seçiniz</label>
                    <div className="select-custom">
                      <select required className="tf-select w-100" id="tax-office" name="tax_office">
                        <option value="">Vergi Dairesi Seçiniz</option>
                        {/* Vergi dairesi listesi buraya eklenecek */}
                      </select>
                    </div>
                  </fieldset>
                </>
              )}

              {/* Fatura Adresi Kontrolü */}
              <fieldset className="box fieldset">
                <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="same-billing-address"
                    checked={sameBillingAddress}
                    onChange={(e) => setSameBillingAddress(e.target.checked)}
                    style={{ margin: 0, verticalAlign: "middle" }}
                  />
                  <label htmlFor="same-billing-address" style={{ margin: 0, lineHeight: "1.5" }}>
                    Fatura adresim ile teslimat adresim aynı
                  </label>
                </div>
              </fieldset>

              {/* Fatura Adresi Formu (eğer aynı değilse) */}
              {!sameBillingAddress && (
                <>
                  <h5 className="fw-5 mb_20 mt_40">2 - Fatura Adresi</h5>
                  <fieldset className="box fieldset">
                    <label htmlFor="billing-address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
                    <input
                      required
                      type="text"
                      id="billing-address-title"
                      name="billing[address_title]"
                      placeholder="Örn: İş Yerim"
                    />
                  </fieldset>

                  <div className="box grid-2">
                    <fieldset className="fieldset">
                      <label htmlFor="billing-first-name">Ad*</label>
                      <input required type="text" id="billing-first-name" name="billing[first_name]" />
                    </fieldset>
                    <fieldset className="fieldset">
                      <label htmlFor="billing-last-name">Soyad*</label>
                      <input required type="text" id="billing-last-name" name="billing[last_name]" />
                    </fieldset>
                  </div>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-phone">Telefon Numarası*</label>
                    <input required type="tel" id="billing-phone" name="billing[phone]" />
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-email">E-Mail Adresi*</label>
                    <input required type="email" id="billing-email" name="billing[email]" />
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-city">İl*</label>
                    <div className="select-custom">
                      <select required className="tf-select w-100" id="billing-city" name="billing[city]">
                        <option value="">Seçiniz</option>
                      </select>
                    </div>
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-district">İlçe*</label>
                    <div className="select-custom">
                      <select required className="tf-select w-100" id="billing-district" name="billing[district]">
                        <option value="">Önce il seçiniz</option>
                      </select>
                    </div>
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-neighborhood">Mahalle / Semt*</label>
                    <div className="select-custom">
                      <select
                        required
                        className="tf-select w-100"
                        id="billing-neighborhood"
                        name="billing[neighborhood]"
                      >
                        <option value="">Önce ilçe seçiniz</option>
                      </select>
                    </div>
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-street">Sokak / Cadde*</label>
                    <div className="select-custom">
                      <select required className="tf-select w-100" id="billing-street" name="billing[street]">
                        <option value="">Önce mahalle seçiniz</option>
                      </select>
                    </div>
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="billing-address-detail">Bina numarası, kapı numarası, bina adı....</label>
                    <textarea
                      name="billing[address_detail]"
                      id="billing-address-detail"
                      rows={4}
                      placeholder="Detaylı adres bilgisi"
                    />
                  </fieldset>

                  {invoiceType === "individual" && (
                    <fieldset className="box fieldset">
                      <label htmlFor="billing-tc-identity">T.C. Kimlik Numaranız*</label>
                      <input
                        required
                        type="text"
                        id="billing-tc-identity"
                        name="billing[tc_identity]"
                        maxLength={11}
                        pattern="[0-9]{11}"
                      />
                    </fieldset>
                  )}

                  {invoiceType === "corporate" && (
                    <>
                      <fieldset className="box fieldset">
                        <label htmlFor="billing-company-name">Firma Adı*</label>
                        <input
                          required
                          type="text"
                          id="billing-company-name"
                          name="billing[company_name]"
                          placeholder="Firma Adı"
                        />
                      </fieldset>
                      <fieldset className="box fieldset">
                        <label htmlFor="billing-tax-number">Vergi Numaranız*</label>
                        <input
                          required
                          type="text"
                          id="billing-tax-number"
                          name="billing[tax_number]"
                          placeholder="Vergi Numaranız"
                        />
                      </fieldset>
                      <fieldset className="box fieldset">
                        <label htmlFor="billing-tax-office">Vergi Dairesi Seçiniz*</label>
                        <div className="select-custom">
                          <select
                            required
                            className="tf-select w-100"
                            id="billing-tax-office"
                            name="billing[tax_office]"
                          >
                            <option value="">Vergi Dairesi Seçiniz</option>
                            {/* Vergi dairesi listesi buraya eklenecek */}
                          </select>
                        </div>
                      </fieldset>
                    </>
                  )}
                </>
              )}

              <p className="text_black-2 mb_20" style={{ fontSize: "12px", marginTop: "20px" }}>
                Kargonuzun size sorunsuz şekilde ulaşabilmesi için bilgilerinizi eksiksiz girdiğinizden emin olun.
              </p>

              <fieldset className="box fieldset">
                <label htmlFor="note">Sipariş notu (isteğe bağlı )</label>
                <textarea id="note" value={orderNote} onChange={(e) => handleOrderNoteChange(e.target.value)} />
              </fieldset>
            </form>
          </div>
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
                <div className="coupon-box">
                  <input required type="text" placeholder="İndirim Kodu" />
                  <a href="#" className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn">
                    Uygula
                  </a>
                </div>
                <div className="d-flex justify-content-between line pb_10">
                  <h6 className="fw-5" style={{ fontSize: "14px" }}>
                    Ara Toplam
                  </h6>
                  <h6 className="fw-5" style={{ fontSize: "14px" }}>
                    ₺{cartTotals.subtotal.toLocaleString("tr-TR")}
                  </h6>
                </div>
                {cartTotals.discount > 0 && (
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
                <div className="wd-check-payment">
                  <div className="fieldset-radio mb_20">
                    <input required type="radio" name="payment" id="bank" className="tf-check" defaultChecked />
                    <label htmlFor="bank">Doğrudan banka transfer</label>
                  </div>
                  <div className="fieldset-radio mb_20">
                    <input required type="radio" name="payment" id="delivery" className="tf-check" />
                    <label htmlFor="delivery">Nakit teslimat</label>
                  </div>
                  <p className="text_black-2 mb_20">
                    Kişisel verileriniz siparişinizi işlemek için kullanılacak, bu web sitesinde deneyiminizi
                    desteklemek ve diğer amaçlar için kullanılacaktır.
                  </p>
                  <div className="box-checkbox fieldset-radio mb_20">
                    <input required type="checkbox" id="check-agree" className="tf-check" />
                    <label htmlFor="check-agree" className="text_black-2">
                      <Link href={`/terms-conditions`}>Şartları ve Koşulları</Link> kabul ediyorum
                    </label>
                  </div>
                </div>
                <button className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center">
                  Sipariş Ver
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
