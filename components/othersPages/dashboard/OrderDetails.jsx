"use client";
import React, { useEffect } from "react";
import Image from "next/image";
export default function OrderDetails() {
  useEffect(() => {
    const tabs = () => {
      document.querySelectorAll(".widget-tabs").forEach((widgetTab) => {
        const titles = widgetTab.querySelectorAll(
          ".widget-menu-tab .item-title"
        );

        titles.forEach((title, index) => {
          title.addEventListener("click", () => {
            // Remove active class from all menu items
            titles.forEach((item) => item.classList.remove("active"));
            // Add active class to the clicked item
            title.classList.add("active");

            // Remove active class from all content items
            const contentItems = widgetTab.querySelectorAll(
              ".widget-content-tab > *"
            );
            contentItems.forEach((content) =>
              content.classList.remove("active")
            );

            // Add active class and fade-in effect to the matching content item
            const contentActive = contentItems[index];
            contentActive.classList.add("active");
            contentActive.style.display = "block";
            contentActive.style.opacity = 0;
            setTimeout(() => (contentActive.style.opacity = 1), 0);

            // Hide all siblings' content
            contentItems.forEach((content, idx) => {
              if (idx !== index) {
                content.style.display = "none";
              }
            });
          });
        });
      });
    };

    // Call the function to initialize the tabs
    tabs();

    // Clean up event listeners when the component unmounts
    return () => {
      document
        .querySelectorAll(".widget-menu-tab .item-title")
        .forEach((title) => {
          title.removeEventListener("click", () => { });
        });
    };
  }, []);
  return (
    <div className="wd-form-order">
      <div className="order-head">
        <figure className="img-product">
          <Image
            alt="product"
            src="/images/products/brown.jpg"
            width="720"
            height="1005"
          />
        </figure>
        <div className="content">
          <div className="badge">Devam Ediyor</div>
          <h6 className="mt-8 fw-5">Order #17493</h6>
        </div>
      </div>
      <div className="tf-grid-layout md-col-2 gap-15">
        <div className="item">
          <div className="text-2 text_black-2">Ürün</div>
          <div className="text-2 mt_4 fw-6">Fashion</div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Kargo</div>
          <div className="text-2 mt_4 fw-6">Ribbed modal T-shirt</div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Başlangıç Zamanı</div>
          <div className="text-2 mt_4 fw-6">04 September 2024, 13:30:23</div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Adres</div>
          <div className="text-2 mt_4 fw-6">
            1234 Fashion Street, Suite 567, New York
          </div>
        </div>
      </div>
      <div className="widget-tabs style-has-border widget-order-tab">
        <ul className="widget-menu-tab">
          <li className="item-title active">
            <span className="inner">Sipariş Geçmişi</span>
          </li>
          <li className="item-title">
            <span className="inner">Ürün Detayları</span>
          </li>
          <li className="item-title">
            <span className="inner">Kargo</span>
          </li>
          <li className="item-title">
            <span className="inner">Alıcı</span>
          </li>
        </ul>
        <div className="widget-content-tab">
          <div className="widget-content-inner active">
            <div className="widget-timeline">
              <ul className="timeline">
                <li>
                  <div className="timeline-badge success" />
                  <div className="timeline-box">
                    <a className="timeline-panel" href="#">
                      <div className="text-2 fw-6">Ürün Gönderildi</div>
                      <span>10/07/2024 4:30pm</span>
                    </a>
                    <p>
                      <strong>Kargo Hizmeti : </strong>FedEx World Service
                      Center
                    </p>
                    <p>
                      <strong>Tahmini Teslimat Tarihi : </strong>12/07/2024
                    </p>
                  </div>
                </li>
                <li>
                  <div className="timeline-badge success" />
                  <div className="timeline-box">
                    <a className="timeline-panel" href="#">
                      <div className="text-2 fw-6">Ürün Gönderildi</div>
                      <span>10/07/2024 4:30pm</span>
                    </a>
                    <p>
                      <strong>Takip Numarası : </strong>2307-3215-6759
                    </p>
                    <p>
                      <strong>Depo : </strong>T-Shirt 10b
                    </p>
                  </div>
                </li>
                <li>
                  <div className="timeline-badge" />
                  <div className="timeline-box">
                    <a className="timeline-panel" href="#">
                      <div className="text-2 fw-6">Ürün Paketlendi</div>
                      <span>12/07/2024 4:34pm</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="timeline-badge" />
                  <div className="timeline-box">
                    <a className="timeline-panel" href="#">
                      <div className="text-2 fw-6">Sipariş Verildi</div>
                      <span>11/07/2024 2:36pm</span>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="widget-content-inner">
            <div className="order-head">
              <figure className="img-product">
                <Image
                  alt="product"
                  src="/images/products/brown.jpg"
                  width="720"
                  height="1005"
                />
              </figure>
              <div className="content">
                <div className="text-2 fw-6">Ribbed modal T-shirt</div>
                <div className="mt_4">
                  <span className="fw-6">Fiyat :</span> $28.95
                </div>
                <div className="mt_4">
                  <span className="fw-6">Beden :</span> XL
                </div>
              </div>
            </div>
            <ul>
              <li className="d-flex justify-content-between text-2">
                <span>Toplam Fiyat</span>
                <span className="fw-6">$28.95</span>
              </li>
              <li className="d-flex justify-content-between text-2 mt_4 pb_8 line">
                <span>Toplam İndirim</span>
                <span className="fw-6">$10</span>
              </li>
              <li className="d-flex justify-content-between text-2 mt_8">
                <span>Toplam Sipariş</span>
                <span className="fw-6">$18.95</span>
              </li>
            </ul>
          </div>
          <div className="widget-content-inner">
            <p>
              Kargo hizmetimiz hızlı, güvenilir ve güvenli teslimat çözümlerini
              sunmak için odaklanıyor. Belge, paket veya büyük gönderileriniz için
              ihtiyaçlarınıza uygun hızlı, güvenilir ve güvenli teslimat çözümleri
              sunuyoruz. Müşteri memnuniyetine odaklanarak gerçek zamanlı takip,
              geniş rotalar ve yerel ve uluslararası teslimat seçenekleriyle
              sizin için kolay ve verimli teslimat deneyimi sunuyoruz.
            </p>
          </div>
          <div className="widget-content-inner">
            <p className="text-2 text_success">
              Teşekkürler, Siparişiniz alındı
            </p>
            <ul className="mt_20">
              <li>
                Sipariş Numarası : <span className="fw-7">#17493</span>
              </li>
              <li>
                Tarih : <span className="fw-7"> 17/07/2024, 02:34pm</span>
              </li>
              <li>
                Toplam : <span className="fw-7">$18.95</span>
              </li>
              <li>
                Ödeme Yöntemi :<span className="fw-7">Nakliye Ödemesi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
