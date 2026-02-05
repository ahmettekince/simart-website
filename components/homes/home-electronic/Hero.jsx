"use client";
import React from "react";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Hero({ banners = [] }) {
  // Veri yoksa bileşeni render etme
  if (!banners || banners.length === 0) return null;

  return (
    <div className="tf-slideshow slider-home-2 slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        loop={banners.length > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        speed={1000}
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, el: ".spd160" }}
        className="tf-sw-slideshow"
      >
        {banners.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="wrap-slider">
              {slide.link ? (
                <Link href={slide.link} className="d-block w-100 h-100">
                  <BannerContent images={slide.images} isFirstSlide={index === 0} />
                </Link>
              ) : (
                <BannerContent images={slide.images} isFirstSlide={index === 0} />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination sw-absolute-2">
        <div className="container">
          <div className="sw-dots sw-pagination-slider justify-content-center spd160" />
        </div>
      </div>
    </div>
  );
}

// Görsel boyutları: layout için sabit oran, tarayıcının yanlış boyutta render etmesini önler
const BANNER_SIZES = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 1024, height: 576 },
  mobile: { width: 768, height: 934 },
};

// Görsel içeriği yöneten alt bileşen — ilk slide eager, diğerleri lazy
function BannerContent({ images, isFirstSlide = false }) {
  if (!images) return null;
  const loadMode = isFirstSlide ? "eager" : "lazy";

  return (
    <>
      {/* Desktop (>= 1024px) */}
      <div className="d-none d-lg-block w-100 h-100">
        <img
          src={images.desktop?.url}
          alt="Banner Desktop"
          width={BANNER_SIZES.desktop.width}
          height={BANNER_SIZES.desktop.height}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          loading={loadMode}
          decoding="async"
        />
      </div>

      {/* Tablet (768px - 1023px) */}
      <div className="d-none d-md-block d-lg-none w-100 h-100">
        <img
          src={images.tablet?.url}
          alt="Banner Tablet"
          width={BANNER_SIZES.tablet.width}
          height={BANNER_SIZES.tablet.height}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          loading={loadMode}
          decoding="async"
        />
      </div>

      {/* Mobile (< 768px) */}
      <div className="d-block d-md-none w-100 mobile-banner-wrap">
        <img
          src={images.mobile?.url}
          alt="Banner Mobile"
          width={BANNER_SIZES.mobile.width}
          height={BANNER_SIZES.mobile.height}
          className="w-100 h-auto"
          style={{ objectFit: "cover", maxWidth: "100%" }}
          loading={loadMode}
          decoding="async"
        />
      </div>
    </>
  );
}
