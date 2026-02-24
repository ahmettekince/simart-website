"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import NavDotsPill from "@/components/common/NavDotsPill";

export default function Hero({ banners = [] }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Veri yoksa bileşeni render etme
  if (!banners || banners.length === 0) return null;

  const total = banners.length;

  return (
    <div className="tf-slideshow slider-home-2 slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        loop={total > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        speed={1000}
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
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
        {total > 1 && (
          <div className="wrap-pagination sw-absolute-2">
            <div className="container d-flex justify-content-center">
              <NavDotsPill
                total={total}
                activeIndex={activeIndex}
                onDotClick={(i) => swiperRef.current?.slideToLoop?.(i) ?? swiperRef.current?.slideTo?.(i)}
                ariaLabel="Banner slaytları"
              />
            </div>
          </div>
        )}
      </Swiper>
    </div>
  );
}

// Görsel içeriği yöneten alt bileşen — ilk slide eager, diğerleri lazy
function BannerContent({ images, isFirstSlide = false }) {
  if (!images) return null;

  return (
    <>
      {/* Desktop Version (>= 1024px) - görüntülenen boyuta uygun, büyük dosya indirilmez */}
      {/* Desktop */}
      <div className="d-none d-lg-block w-100" style={{ overflow: "hidden" }}>
        <Image
          src={images.desktop?.url}
          alt="Banner Desktop"
          width={1920}
          height={500}
          className="w-100 h-auto"
          style={{ objectFit: "cover", display: "block" }}
          sizes="100vw"
          quality={100}
          priority={isFirstSlide}
          {...(isFirstSlide ? { fetchPriority: "high" } : {})}
        />
      </div>

      {/* Tablet */}
      <div className="d-none d-md-block d-lg-none w-100" style={{ overflow: "hidden" }}>
        <Image
          src={images.tablet?.url}
          alt="Banner Tablet"
          width={1080}
          height={535}
          className="w-100 h-auto"
          style={{ objectFit: "cover", display: "block" }}
          sizes="100vw"
          quality={100}
          priority={isFirstSlide}
          {...(isFirstSlide ? { fetchPriority: "high" } : {})}
        />
      </div>

      {/* Mobile */}
      <div className="d-block d-md-none w-100" style={{ overflow: "hidden" }}>
        <Image
          src={images.mobile?.url}
          alt="Banner Mobile"
          width={750}
          height={875}
          className="w-100 h-auto"
          style={{ objectFit: "cover", display: "block", maxWidth: "100%" }}
          sizes="(max-width: 768px) 100vw, 800px"
          quality={100}
          priority={isFirstSlide}
          {...(isFirstSlide ? { fetchPriority: "high" } : {})}
        />
      </div>
    </>
  );
}