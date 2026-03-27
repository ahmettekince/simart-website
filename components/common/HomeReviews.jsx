"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import NavDotsPill from "@/components/common/NavDotsPill";
import StarRating from "@/components/common/StarRating";

export default function HomeReviews({ reviews = [] }) {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="flat-spacing-5 pt_0 flat-testimonial" style={{ maxWidth: "100vw", overflow: "hidden" }}>
            <div className="container">
                <div className="flat-title wow fadeInUp" data-wow-delay="0s" suppressHydrationWarning>
                    <span className="title">Kullanıcı Yorumları</span>
                    <p className="sub-title">Sizden gelen değerlendirmeler</p>
                </div>
                <div className="wrap-carousel">
                    <Swiper
                        dir="ltr"
                        className="swiper tf-sw-testimonial"
                        spaceBetween={30}
                        slidesPerView={3}
                        loop={reviews.length > 3}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex ?? swiper.activeIndex)}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                spaceBetween: 15,
                            },
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 15,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                        }}
                        modules={[Navigation, Pagination]}
                        navigation={{
                            prevEl: ".snbp3",
                            nextEl: ".snbn3",
                        }}
                    >
                        {reviews.map((review, index) => {
                            // Mask name logic: Al*** AK***
                            const maskName = (name) => {
                                if (!name) return "M*** K***";
                                const parts = name.trim().split(" ");
                                return parts.map(part => {
                                    if (part.length === 0) return "";
                                    if (part.length <= 2) return part + "***";
                                    return part.substring(0, 2) + "***";
                                }).join(" ");
                            };

                            const fullName = review.customer?.full_name ||
                                (review.customer?.first_name ? `${review.customer.first_name} ${review.customer.last_name || ''}` : "Misafir Kullanıcı");

                            const maskedName = maskName(fullName);

                            // Construct product link
                            const categorySlug = review.product?.categories?.[0]?.slug || "urunler";
                            const productSlug = review.product?.slug;
                            const productLink = productSlug ? `/magaza/${categorySlug}/${productSlug}` : "#";

                            return (
                                <SwiperSlide className="swiper-slide" key={review.id || index}>
                                    <div
                                        className="testimonial-item style-column wow fadeInUp"
                                        data-wow-delay={`${index * 0.1}s`}
                                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                        suppressHydrationWarning
                                    >
                                        <div className="rating">
                                            <StarRating rating={review.rating} showNumber={false} showReviewCount={false} />
                                        </div>
                                        <div className="text" style={{
                                            flex: 1,
                                            marginBottom: '15px',
                                            minHeight: '52px',
                                            lineHeight: '1.3',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '16px'
                                        }}>
                                            "{review.comment}"
                                        </div>
                                        <div className="author" style={{ marginBottom: '15px' }}>
                                            <div className="name" style={{ fontWeight: '600' }}>
                                                {maskedName}
                                            </div>
                                        </div>

                                        {review.product && (
                                            <div className="product" style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                                <div className="image">
                                                    <Link href={productLink}>
                                                        <img
                                                            className="lazyload"
                                                            src={review.product.cover_image.thumbnail_url}
                                                            alt={review.product.name}
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="content-wrap">
                                                    <div className="product-title">
                                                        <Link href={productLink}>{review.product.name}</Link>
                                                    </div>
                                                </div>
                                                <Link href={productLink} className="">
                                                    <i className="icon-arrow1-top-left" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                    {reviews.length >= 3 && (
                        <>
                            <div className="nav-sw nav-next-slider nav-next-testimonial lg snbp3">
                                <span className="icon icon-arrow-left" />
                            </div>
                            <div className="nav-sw nav-prev-slider nav-prev-testimonial lg snbn3">
                                <span className="icon icon-arrow-right" />
                            </div>
                            <div className="d-flex justify-content-center" style={{ marginTop: "20px" }}>
                                <NavDotsPill
                                    total={reviews.length}
                                    activeIndex={activeIndex}
                                    onDotClick={(i) => swiperRef.current?.slideToLoop?.(i) ?? swiperRef.current?.slideTo?.(i)}
                                    ariaLabel="Kullanıcı yorumları"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
