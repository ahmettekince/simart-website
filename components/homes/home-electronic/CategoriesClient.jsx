"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import NavDotsPill from "@/components/common/NavDotsPill";

const CATEGORY_PLACEHOLDER = "/images/item/pr1.jpg"; // Mevcut bir görselle değiştirildi

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
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={600}
        className="tf-sw-collection"
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {categories.map((item, index) => (
          <SwiperSlide key={index} style={{ border: "1px solid #f0f0f0", borderRadius: "12px", background: "#fff", height: '240px' }}>
            <div className="collection-item-v2 type-small hover-img" style={{ height: '100%' }}>
              <Link href={`/magaza/${item.slug || "collection-sub"}`} className="collection-inner" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="collection-image img-style" style={{ padding: '30px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    alt={item.name}
                    src={getCategoryImageSrc(item.image?.url)}
                    width={180}
                    height={180}
                    style={{ objectFit: "contain", width: '100%', height: '100%' }}
                    priority={index < 2}
                    loading={index < 6 ? "eager" : "lazy"}
                    fetchPriority={index < 2 ? "high" : "auto"}
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 25vw, (max-width: 1200px) 16vw, 200px"
                    unoptimized={getCategoryImageSrc(item.image?.url).startsWith('/')}
                    quality={100}
                  />
                </div>
                <div className="collection-content" style={{ position: 'relative', inset: 'unset', padding: '0 10px 20px', textAlign: 'center' }}>
                  <div className="top">
                    <h5 className="fw-5" style={{ fontSize: "14px" }} >{item.name}</h5>
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
