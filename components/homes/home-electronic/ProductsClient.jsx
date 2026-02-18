"use client";
import React, { useRef, useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";
import NavDotsPill from "@/components/common/NavDotsPill";

export default function ProductsClient({ products = [] }) {
    const displayProducts = Array.isArray(products) ? products : [];
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const total = displayProducts.length;

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
                        key={total}
                        dir="ltr"
                        slidesPerView={4}
                        spaceBetween={30}
                        loop={total > 4}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        speed={1000}
                        observer={true}
                        observeParents={true}
                        modules={[Autoplay]}
                        breakpoints={{
                            1100: { slidesPerView: 4, spaceBetween: 30, loop: total > 4 },
                            768: { slidesPerView: 3, spaceBetween: 20, loop: total > 3 },
                            640: { slidesPerView: 2, spaceBetween: 12, loop: total > 2 },
                            0: { slidesPerView: 2, spaceBetween: 8, loop: total > 2 },
                        }}
                        className="tf-sw-product-sell-1"
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    >
                        {displayProducts.map((product, index) => (
                            <SwiperSlide key={index} className="height-auto">
                                <ProductCardSimart product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {total > 1 && (
                        <div className="box-sw-navigation">
                            <NavDotsPill
                                total={total}
                                activeIndex={activeIndex}
                                onDotClick={(i) => swiperRef.current?.slideToLoop?.(i) ?? swiperRef.current?.slideTo?.(i)}
                                ariaLabel="Ürün slaytları"
                            />
                        </div>
                    )}
                </div>
            </div>
            <style jsx global>{`
                .tf-sw-product-sell-1 .swiper-slide {
                    height: auto;
                }
                .products-pagination-wrapper .box-sw-navigation {
                    position: static !important;
                    display: flex !important;
                    justify-content: center;
                    margin-top: 16px;
                }
            `}</style>
        </section>
    );
}
