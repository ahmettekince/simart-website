"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import NavDotsPill from "@/components/common/NavDotsPill";
import { getLocalizedUrl } from "@/utils/i18n";

const translations = {
    tr: {
        title: "Blog Yazıları",
        readMore: "Devamını Oku",
        ariaLabel: "Blog slaytları"
    },
    en: {
        title: "Latest from Blog",
        readMore: "Read More",
        ariaLabel: "Blog slides"
    }
};

export default function BlogsClient({ blogs = [], lang = "tr" }) {
    const t = translations[lang] || translations.tr;
    if (!blogs || blogs.length === 0) {
        return null;
    }

    const displayBlogs = blogs;
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const total = displayBlogs.length;

    return (
        <section className="flat-spacing-14">
            <div className="container">
                <div
                    className="flat-title wow fadeInUp"
                    data-wow-delay="0s"
                    suppressHydrationWarning
                >
                    <span className="title">{t.title}</span>
                </div>
                <div className="hover-sw-nav view-default hover-sw-3 sw-pagination-wrapper blogs-pagination-wrapper">
                    <Swiper
                        dir="ltr"
                        className="swiper tf-sw-product-sell"
                        slidesPerView={3}
                        spaceBetween={30}
                        loop={total > 1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            0: { slidesPerView: 1 },
                        }}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    >
                        {displayBlogs.map((article, index) => {
                            const activeSlug = article.slugs?.[lang] || article.slug || article.title?.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                            const imgSrc = article.image?.url || article.imgSrc || "/images/blog/blog-1.jpg";
                            
                            const blogLink = getLocalizedUrl(`/${activeSlug}`, lang);
                            const categoryLink = getLocalizedUrl(`/blog`, lang);

                            return (
                                <SwiperSlide key={index}>
                                    <div
                                        className="blog-article-item wow fadeInUp"
                                        data-wow-delay={article.delay || "0s"}
                                        suppressHydrationWarning
                                    >
                                        <div className="article-thumb" style={{ position: 'relative', aspectRatio: '550/354', overflow: 'hidden' }}>
                                            <Link href={blogLink} style={{ display: 'block', position: 'relative', width: '100%', height: '100%' }}>
                                                <Image
                                                    className="lazyload"
                                                    alt={article.title || article.name}
                                                    src={imgSrc}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </Link>
                                            <div className="article-label">
                                                <Link
                                                    href={categoryLink}
                                                    className="tf-btn btn-sm animate-hover-btn"
                                                >
                                                    Blog
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="article-content">
                                            <div className="article-title">
                                                <Link href={blogLink}>
                                                    {article.title || article.name}
                                                </Link>
                                            </div>
                                            <div className="article-btn">
                                                <Link
                                                    href={blogLink}
                                                    className="tf-btn btn-line fw-6"
                                                >
                                                    {t.readMore}
                                                    <i className="icon icon-arrow1-top-left" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            )
                        })}
                    </Swiper>
                    {total > 1 && (
                        <div className="box-sw-navigation">
                            <NavDotsPill
                                total={total}
                                activeIndex={activeIndex}
                                onDotClick={(i) => swiperRef.current?.slideToLoop?.(i)}
                                ariaLabel={t.ariaLabel}
                            />
                        </div>
                    )}
                </div>
            </div>
            <style jsx global>{`
                .blogs-pagination-wrapper .box-sw-navigation {
                    position: static !important;
                    display: flex !important;
                    justify-content: center;
                    margin-top: 16px;
                }
            `}</style>
        </section>
    );
}
