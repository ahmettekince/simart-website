"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
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

// Görsel içeriği yöneten alt bileşen — ilk slide eager, diğerleri lazy
function BannerContent({ images, isFirstSlide = false }) {
  if (!images) return null;
  const loadMode = isFirstSlide ? "eager" : "lazy";

  return (
    <>
      {/* Desktop - responsive boyut + yüksek kalite (quality=90) */}
      <div className="d-none d-lg-block w-100 h-100">
        <Image
          src={images.desktop?.url}
          alt="Banner Desktop"
          width={1920}
          height={1080}
          quality={90}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          sizes="100vw"
          priority={isFirstSlide}
        />
      </div>

      {/* Tablet */}
      <div className="d-none d-md-block d-lg-none w-100 h-100">
        <Image
          src={images.tablet?.url}
          alt="Banner Tablet"
          width={1024}
          height={768}
          quality={90}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          sizes="100vw"
          priority={isFirstSlide}
        />
      </div>

      {/* Mobile - görüntülenen boyuta uygun, kalite düşmez */}
      <div className="d-block d-md-none w-100 mobile-banner-wrap">
        <Image
          src={images.mobile?.url}
          alt="Banner Mobile"
          width={800}
          height={934}
          quality={90}
          className="w-100 h-auto"
          style={{ objectFit: "cover", maxWidth: "100%" }}
          sizes="(max-width: 768px) 100vw, 800px"
          priority={isFirstSlide}
        />
      </div>
    </>
  );
}
