"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";

export default function ProductsClient({ products = [] }) {
    const displayProducts = Array.isArray(products) ? products : [];
    if (displayProducts.length === 0) return null;

    return (
        <section className="flat-spacing-19">
            <div className="container">
                <div className="flat-title px-0">
                    <span className="title wow fadeInUp" data-wow-delay="0s" suppressHydrationWarning={true}>
                        İlginizi çekebilecekler
                    </span>
                </div>
                <div className="sw-pagination-wrapper products-pagination-wrapper">
                    <Swiper
                        dir="ltr"
                        spaceBetween={10}
                        slidesPerView={2} // Mobil (Varsayılan)
                        loop={true}
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
