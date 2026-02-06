"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import NavDotsPill from "@/components/common/NavDotsPill";

const CATEGORY_PLACEHOLDER = "/images/collections/collection-1.jpg";

function getCategoryImageSrc(url) {
  if (!url || typeof url !== "string" || url.trim() === "") return CATEGORY_PLACEHOLDER;
  return url;
}

export default function CategoriesClient({ categories }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = categories.length;

  return (
    <div className="sw-pagination-wrapper categories-pagination-wrapper">
      <Swiper
        dir="ltr"
        slidesPerView={6}
        spaceBetween={16}
        breakpoints={{
          1200: { slidesPerView: 6 },
          992: { slidesPerView: 5 },
          768: { slidesPerView: 4 },
          480: { slidesPerView: 3 },
          0: { slidesPerView: 2 },
        }}
        loop={total > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        speed={600}
        className="tf-sw-collection"
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {categories.map((item, index) => (
          <SwiperSlide key={index} style={{ border: "2px solid #f5f5f5", borderRadius: "12px" }}>
            <div className="collection-item-v2 type-small hover-img">
              <Link href={`/magaza/${item.slug || "collection-sub"}`} className="collection-inner">
                <div className="collection-image img-style radius-10">
                  <Image
                    className="lazyload"
                    alt={item.name}
                    src={getCategoryImageSrc(item.image?.url)}
                    width={600}
                    height={730}
                    loading="lazy"
                  />
                </div>
                <div className="collection-content">
                  <div className="top">
                    <h5 className="heading fw-5">{item.name}</h5>
                  </div>

                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {total > 1 && (
        <div className="box-sw-navigation">
          <NavDotsPill
            total={total}
            activeIndex={activeIndex}
            onDotClick={(i) => swiperRef.current?.slideToLoop?.(i)}
            ariaLabel="Kategori slaytları"
          />
        </div>
      )}
    </div>
  );
}
