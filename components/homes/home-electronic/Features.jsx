"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import NavDotsPill from "@/components/common/NavDotsPill";
import Image from "next/image";

// Ekranda kaç kart görünüyor: desktop 4, tablet 3, mobil 1
function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(4);
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w >= 1024) setSlidesPerView(4);
      else if (w >= 768) setSlidesPerView(3);
      else setSlidesPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return slidesPerView;
}

const FEATURES_DATA = {
  tr: [
    {
      image: "/images/home/ucretsiz_kargo.png",
      title: "Ücretsiz Kargo",
      description: "Türkiye'nin her yerine ücretsiz kargo ile, alışverişinizi zahmetsizce tamamlayın.",
      color: "#3c81b5",
    },
    {
      image: "/images/home/48_saat_garanti.png",
      title: "Çözüm Garantili",
      description: "48 saatte çözüm garantili teknik destek sunuyoruz.",
      color: "#2563eb",
    },
    {
      icon: "payment",
      title: "Güvenli Ödeme",
      description: "Tüm siparişlerinizde sorunsuz, güvenli ödemeyle kusursuz alışveriş sunuyoruz.",
      color: "#3c81b5",
    },
    {
      image: "/images/home/yerli_uretim.svg",
      title: "Yerli Üretim",
      description: "Kaliteli ve yerli üretim ürünlerimizle Türkiye'nin geleceğine katkı sağlıyoruz.",
      color: "#7c3aed",
      imgStyle: { height: "40px" }
    },
  ],
  en: [
    {
      image: "/images/home/ucretsiz_kargo.png",
      title: "Free Shipping",
      description: "Complete your shopping effortlessly with free shipping across all of Turkey.",
      color: "#3c81b5",
    },
    {
      image: "/images/home/48_saat_garanti.png",
      title: "Solution Guaranteed",
      description: "We offer technical support with a 48-hour solution guarantee.",
      color: "#2563eb",
    },
    {
      icon: "payment",
      title: "Secure Payment",
      description: "We offer a seamless and secure payment experience for all your orders.",
      color: "#3c81b5",
    },
    {
      image: "/images/home/yerli_uretim.svg",
      title: "Local Production",
      description: "We contribute to Turkey's future with our high-quality and locally produced products.",
      color: "#7c3aed",
      imgStyle: { height: "40px" }
    },
  ]
};

const ICONS = {
  shipping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  payment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  local: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default function Features({ lang = "tr", items: propItems }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slidesPerView = useSlidesPerView();
  
  const items = propItems || FEATURES_DATA[lang] || FEATURES_DATA.tr;
  const showNavDots = items.length > slidesPerView;

  if (!items || items.length === 0) return null;

  return (
    <section className="features-section">
      <div className="container">
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex ?? swiper.activeIndex)}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 0 },
            768: { slidesPerView: 3, spaceBetween: 0 },
            1024: { slidesPerView: 4, spaceBetween: 0 },
          }}
          className="features-swiper"
        >
          {items.map((item, i) => (
            <SwiperSlide key={i}>
              <div className="feature-card">
                <div className="feature-icon" style={{ color: item.color || "#3c81b5" }}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={120}
                      height={60}
                      style={{ 
                        width: "auto", 
                        height: "100%", 
                        objectFit: "contain",
                        objectPosition: "left center",
                        ...item.imgStyle
                      }}
                    />
                  ) : (
                    ICONS[item.icon] ?? ICONS.shipping
                  )}
                </div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-desc">{item.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {showNavDots && (
          <div className="features-dots">
            <NavDotsPill
              total={items.length}
              activeIndex={activeIndex}
              onDotClick={(i) => swiperRef.current?.slideTo?.(i)}
              ariaLabel={lang === "tr" ? "Özellikler" : "Features"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
