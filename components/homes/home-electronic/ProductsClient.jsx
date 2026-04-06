"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";

const translations = {
    tr: {
        title: "İlginizi çekebilecekler"
    },
    en: {
        title: "You might be interested in"
    }
};

export default function ProductsClient({ products = [], lang = "tr" }) {
    const t = translations[lang] || translations.tr;
    const displayProducts = Array.isArray(products) ? products : [];
    if (displayProducts.length === 0) return null;

    return (
        <section className="flat-spacing-19">
            <div className="container">
                <div className="flat-title px-0">
                    <span className="title wow fadeInUp" data-wow-delay="0s" suppressHydrationWarning={true}>
                        {t.title}
                    </span>
                </div>
                <div className="sw-pagination-wrapper products-pagination-wrapper">
                    <Swiper
                        dir="ltr"
                        spaceBetween={10}
                        slidesPerView={2} // Mobil (Varsayılan)
                        loop={true}
                        grabCursor={true}
                        touchEventsTarget="container"
                        speed={1500} // Kayma hızı (ms) - Daha yavaş ve smooth geçiş
                        autoplay={{
                            delay: 4000, // Her slaytta bekleme süresi
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        breakpoints={{
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            1024: { // Desktop
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                        modules={[Autoplay]}
                        className="simple-products-slider"
                    >
                        {displayProducts.map((product, index) => (
                            <SwiperSlide key={product.id || index} className="height-auto">
                                <ProductCardSimart product={product} isPriority={index < 8} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
