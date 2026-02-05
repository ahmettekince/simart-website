"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import React from "react";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";

export default function ProductsClient({ products = [] }) {
    const displayProducts = Array.isArray(products) ? products : []; // Sadece API'den gelen ürünler

    return (
        <section className="flat-spacing-19">
            <div className="container">
                <div className="flat-title flex-row justify-content-between px-0">
                    <span className="title wow fadeInUp" data-wow-delay="0s">
                        İlginizi çekebilecekler
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
                                <SwiperSlide className="swiper-slide height-auto" key={index}>
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
            `}</style>
        </section>
    );
}
