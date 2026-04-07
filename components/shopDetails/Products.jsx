"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import React from "react";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";
import { useLangStore } from "@/stores/langStore";

const translations = {
    tr: {
        otherProducts: "Diğer Ürünler"
    },
    en: {
        otherProducts: "Other Products"
    }
};

export default function Products({ products = [] }) {
  const lang = useLangStore((s) => s.lang);
  const t = translations[lang] || translations.tr;
  const displayProducts = Array.isArray(products) ? products : [];

  // Ürünler yoksa render etme
  if (!displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="flat-spacing-19">
      <div className="container">
        <div className="flat-title flex-row justify-content-between px-0">
          <span className="title wow fadeInUp" data-wow-delay="0s" suppressHydrationWarning>
            {t.otherProducts}
          </span>
          <div className="box-sw-navigation">
            <div className="nav-sw square nav-next-slider nav-next-sell-1 snbp161">
              <span className="icon icon-arrow1-left" />
            </div>
            <div className="nav-sw square nav-prev-slider nav-prev-sell-1 snbn161">
              <span className="icon icon-arrow1-right" />
            </div>
          </div>
        </div>
        <div className="hover-sw-nav hover-sw-2">
          <div className="swiper tf-sw-product-sell-1 wrap-sw-over">
            <Swiper
              dir="ltr"
              slidesPerView={4}
              spaceBetween={30}
              grabCursor={true}
              touchEventsTarget="container"
              breakpoints={{
                1100: { slidesPerView: 4, spaceBetween: 30 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                640: { slidesPerView: 2, spaceBetween: 12 },
                0: { slidesPerView: 2, spaceBetween: 8 },
              }}
              className="swiper-wrapper"
              modules={[Navigation]}
              navigation={{
                prevEl: ".snbp161",
                nextEl: ".snbn161",
              }}
            >
              {displayProducts.map((product, index) => (
                <SwiperSlide className="swiper-slide height-auto" key={product.id || index}>
                  <ProductCardSimart product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .tf-sw-product-sell-1 .swiper-slide {
          height: auto;
        }
        .tf-sw-product-sell-1 .main-cart-btn {
          width: 100%;
        }
      `}</style>
    </section>
  );
}
