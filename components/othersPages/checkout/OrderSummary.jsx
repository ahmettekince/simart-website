"use client";
import Image from "next/image";
import Link from "next/link";

export default function OrderSummary({ items, cartTotals }) {
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
          <div className="coupon-box">
            <input required type="text" placeholder="Kupon Kodu" />
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
            </div>
          </div>
          <button className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center">
            Sipariş Ver
          </button>
        </form>
      </div>
    </div>
  );
}
