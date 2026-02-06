"use client";

import { iconBoxes3 } from "@/data/features";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import NavDotsPill from "@/components/common/NavDotsPill";

export default function Features({ bgColor = "", titleFont = "" }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      className={`flat-spacing-1 flat-iconbox  wow fadeInUp ${bgColor}`}
      data-wow-delay="0s"
    >
      <div className="container">
        <div className="wrap-carousel wrap-mobile">
          <Swiper
            dir="ltr"
            className="swiper tf-sw-mobile"
            loop={iconBoxes3.length > 4}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex ?? swiper.activeIndex)}
            breakpoints={{
              1024: { slidesPerView: 4, spaceBetween: 30 },
              768: { slidesPerView: 3, spaceBetween: 30 },
              640: { slidesPerView: 2, spaceBetween: 15 },
              0: { slidesPerView: 1, spaceBetween: 15 },
            }}
          >
            {iconBoxes3.map((box, index) => (
              <SwiperSlide key={index}>
                <div className="tf-icon-box style-row">
                  <div className="icon bg_white">
                    <i className={box.iconClass} />
                  </div>
                  <div className="content">
                    <div className={`title fw-4 ${titleFont}`}>{box.title}</div>
                    <p>{box.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {iconBoxes3.length > 1 && (
            <div className="d-flex justify-content-center" style={{ marginTop: "20px" }}>
              <NavDotsPill
                total={iconBoxes3.length}
                activeIndex={activeIndex}
                onDotClick={(i) => swiperRef.current?.slideToLoop?.(i) ?? swiperRef.current?.slideTo?.(i)}
                ariaLabel="Özellikler"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
