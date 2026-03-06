"use client";
import Image from "next/image";
import Drift from "drift-zoom";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Gallery, Item } from "react-photoswipe-gallery";
import NavDotsPill from "@/components/common/NavDotsPill";
import OverlayCtaButton, { Model3dIcon, PlayIcon, ArrowIcon } from "@/components/common/OverlayCtaButton";
import CircularLoading from "@/components/common/CircularLoading";

// Loading destekli Resim Bileşeni
const SliderImage = forwardRef(({ onLoadingComplete, ...props }, ref) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="slider-image-wrapper" style={{ position: "relative", width: "100%", height: "100%", minHeight: "200px" }}>
      {loading && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, background: "#f9f9f9" }}
        >
          <CircularLoading />
        </div>
      )}
      <Image
        ref={ref}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        {...props}
      />
    </div>
  );
});
SliderImage.displayName = "SliderImage";

export default function Slider({
  currentColor = "Beige",
  handleColor = () => { },
  galleryImages = [],
  product = {},
  onOpenModel3d = () => { },
  onOpenVideo = () => { },
}) {
  // Tek kaynak: galleryImages. İlk görsel zaten cover olarak kabul edilir.
  const normalized = Array.isArray(galleryImages)
    ? galleryImages
      .map((img, index) => {
        const src = typeof img === "string" ? img : img?.url || img?.src || "";
        if (!src) return null;
        return {
          id: index + 1,
          src,
          alt: typeof img === "object" ? img?.alt_text || img?.alt || "" : "",
          width: typeof img === "object" ? img?.width || 770 : 770,
          height: typeof img === "object" ? img?.height || 1075 : 1075,
          dataValue: currentColor?.toLowerCase?.() || "beige",
        };
      })
      .filter(Boolean)
    : [];

  const images =
    normalized.length > 0
      ? [...normalized]
      : [
        {
          id: 1,
          src: "/images/placeholder.jpg",
          alt: "",
          width: 770,
          height: 1075,
          dataValue: currentColor?.toLowerCase?.() || "beige",
        },
      ];

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const swiperRef = useRef(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Slide değişince: state güncelle + soldaki thumb listesini kaydır (loop modunda realIndex kullan)
  const handleSlideChange = (swiper) => {
    const idx = swiper.realIndex ?? swiper.activeIndex;
    setActiveSlideIndex(idx);
    handleColor(images[idx]?.dataValue);
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(idx, 300);
    }
  };

  useEffect(() => {
    const slideIndex = images.filter((elm) => elm.dataValue.toLowerCase() == currentColor.toLowerCase())[0].id - 1;
    swiperRef.current.slideTo(slideIndex);
  }, [currentColor]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dynamically import @google/model-viewer
      import("@google/model-viewer").then(() => {
        // Module is imported, you can use model-viewer functionality here
      });
    }
  }, []);

  const driftInstancesRef = useRef([]);

  useEffect(() => {
    // Function to initialize Drift
    const imageZoom = () => {
      if (typeof window === "undefined" || window.innerWidth < 768) return;
      const driftAll = document.querySelectorAll(".tf-image-zoom");
      const pane = document.querySelector(".tf-zoom-main");
      if (!pane || driftAll.length === 0) return;

      const instances = [];
      driftAll.forEach((el) => {
        try {
          const instance = new Drift(el, {
            zoomFactor: 2,
            paneContainer: pane,
            inlinePane: false,
            handleTouch: false,
            hoverBoundingBox: true,
            containInline: true,
          });
          instances.push(instance);
        } catch (e) {
          // ignore
        }
      });
      driftInstancesRef.current = instances;
    };

    imageZoom();
    const zoomElements = document.querySelectorAll(".tf-image-zoom");

    const handleMouseOver = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.add("zoom-active");
      }
    };

    const handleMouseLeave = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.remove("zoom-active");
      }
    };

    zoomElements.forEach((element) => {
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    // Cleanup: sayfa değişince Drift overlay'leri kaldır
    return () => {
      zoomElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
      // Drift örneklerini destroy et (zoom karesi ve pane gitsin)
      driftInstancesRef.current.forEach((instance) => {
        try {
          if (instance && typeof instance.destroy === "function") {
            instance.destroy();
          }
        } catch (e) {
          // ignore
        }
      });
      driftInstancesRef.current = [];
      // Body'de kalmış drift overlay'leri kaldır (Next.js client navigation sonrası)
      if (typeof document !== "undefined") {
        document.querySelectorAll(".drift-zoom-pane, .drift-bounding-box, .zoom-magnifier-containing .drift-zoom-pane").forEach((el) => el.remove());
        document.querySelectorAll(".section-image-zoom").forEach((el) => el.classList.remove("zoom-active"));
      }
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <>
      <Swiper
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={5}
        loop={true}
        className="swiper tf-product-media-thumbs other-image-zoom"
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        allowTouchMove={true}
        breakpoints={{
          0: {
            direction: "horizontal",
            slidesPerView: "auto",
          },
          1150: {
            direction: "vertical",
            slidesPerView: 5,
          },
        }}
      >
        {images.map((slide, index) => (
          <SwiperSlide className="swiper-slide" key={index}>
            <div className="item" style={{ border: "1px solid #f5f5f5", borderRadius: "8px" }}>
              <Image
                className="lazyload"
                data-src={slide.src}
                alt={""}
                src={slide.src}
                width={slide.width}
                height={slide.height}
                quality={100}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Gallery>
        <div className="tf-product-main-with-dots">
          <Swiper
            dir="ltr"
            style={{ touchAction: "pan-y" }}
            spaceBetween={10}
            slidesPerView={1}
            loop={true}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            className="swiper tf-product-media-main"
            id="gallery-swiper-started"
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Thumbs, Navigation]}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={handleSlideChange}
          >
            {images.map((slide, index) => (
              <SwiperSlide className="swiper-slide" key={index}>
                <Item original={slide.src} thumbnail={slide.src} width={slide.width} height={slide.height}>
                  {({ ref, open }) => (
                    <a onClick={open} className="item" style={{ border: "2px solid #f5f5f5", borderRadius: "8px", position: "relative", display: "block", height: "100%" }}>
                      <SliderImage
                        ref={ref}
                        className="tf-image-zoom lazyload"
                        data-zoom={slide.src}
                        data-src={slide.src}
                        alt="image"
                        src={slide.src}
                        width={slide.width}
                        height={slide.height}
                        quality={100}
                        style={{ objectFit: "contain", width: "100%", height: "100%" }}
                        priority={index === 0}
                        loading="eager"
                      />
                    </a>
                  )}
                </Item>
              </SwiperSlide>
            ))}
            <div className="swiper-button-next button-style-arrow"></div>
            <div className="swiper-button-prev button-style-arrow"></div>
          </Swiper>
          {images.length > 1 && (
            <div className="tf-product-dots-mobile">
              <NavDotsPill
                total={images.length}
                activeIndex={activeSlideIndex}
                onDotClick={(i) => swiperRef.current?.slideTo(i)}
                ariaLabel="Ürün görselleri"
              />
            </div>
          )}
          {/* Trendyol tarzı medya overlay butonları - Mobilde kalsın, desktopta Detail üstten hallediyor */}
          <div className="overlay-cta-buttons-wrapper d-md-none">
            {(product.model_3d_url || product.media?.model_3d_url) && (
              <OverlayCtaButton
                position="right"
                onClick={onOpenModel3d}
                ariaLabel="3D modeli incele"
                leftIcon={<Model3dIcon size={12} />}
                variant="primary"
              >
                3D GÖRÜNTÜLEME
              </OverlayCtaButton>
            )}
            {product.video_url && (
              <OverlayCtaButton
                position="right"
                onClick={onOpenVideo}
                ariaLabel="Ürün videosunu izle"
                leftIcon={<PlayIcon size={14} />}
                rightIcon={<ArrowIcon size={10} />}
              >
                ÜRÜN VİDEOSUNU İZLE
              </OverlayCtaButton>
            )}
          </div>
        </div>
      </Gallery>
    </>
  );
}
