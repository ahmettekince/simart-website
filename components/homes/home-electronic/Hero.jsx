"use client";
import { useRef, useState } from "react";
import Link from "next/link";
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
        {banners.map((slide, index) => {
          const content = <BannerContent images={slide.images} isPriority={index === 0} />;

          return (
            <SwiperSlide key={index}>
              <div className="wrap-slider">
                {slide.link ? (
                  <Link href={slide.link} className="d-block w-100 h-100">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            </SwiperSlide>
          );
        })}
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

function BannerContent({ images, isPriority = false }) {
  if (!images) return null;

  return (
    <>
      {/* Desktop */}
      <div className="d-none d-lg-block w-100">
        <img
          src={images.desktop?.url}
          alt="Banner Desktop"
          width={1920}
          height={500}
          {...(isPriority ? { fetchPriority: "high" } : {})}
          style={{ objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Tablet */}
      <div className="d-none d-md-block d-lg-none w-100">
        <img
          src={images.tablet?.url}
          alt="Banner Tablet"
          width={1080}
          height={535}
          {...(isPriority ? { fetchPriority: "high" } : {})}
          style={{ objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Mobile */}
      <div className="d-block d-md-none w-100">
        <img
          src={images.mobile?.url}
          alt="Banner Mobile"
          width={750}
          height={875}
          {...(isPriority ? { fetchPriority: "high" } : {})}
          style={{ objectFit: "cover", display: "block" }}
        />
      </div>
    </>
  );
}