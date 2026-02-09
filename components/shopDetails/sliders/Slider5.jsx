"use client";
import Image from "next/image";
import Drift from "drift-zoom";
import { useEffect, useRef, useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Gallery, Item } from "react-photoswipe-gallery";
import ModelViewerModal from "@/components/modals/ModelViewerModal";
import NavDotsPill from "@/components/common/NavDotsPill";

export default function Slider5({
  currentColor = "Beige",
  handleColor = () => { },
  galleryImages = [],
  model3dUrl = null,
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

  // 3D Model Mantığı
  const staticModelUrl = "/images/shop/products/preview_images/dance-bag_3d.glb";
  const finalModelUrl = model3dUrl || staticModelUrl;

  // Her zaman model ekle (static veya prop'tan gelen)
  // if (finalModelUrl) {
  //   images.push({
  //     id: images.length + 1,
  //     src: images[0]?.src || "/images/placeholder.jpg",
  //     modelSrc: finalModelUrl,
  //     alt: "3D Model",
  //     width: 713,
  //     height: 1070,
  //     dataValue: currentColor?.toLowerCase?.() || "beige",
  //     is3D: true,
  //     isModel: true,
  //   });
  // }
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const swiperRef = useRef(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModelUrl, setActiveModelUrl] = useState(null);

  // Slide değişince: state güncelle + soldaki thumb listesini kaydır ki aktif foto görünsün (önce/sonra farkı belli olsun)
  const handleSlideChange = (swiper) => {
    const idx = swiper.activeIndex;
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

  // Model açma fonksiyonu
  const openModelViewer = (url) => {
    setActiveModelUrl(url);
    setIsModalOpen(true);
  };

  return (
    <>
      <ModelViewerModal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        modelSrc={activeModelUrl}
      />
      <Swiper
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={5}
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
            <div className={`item ${slide.is3D ? "position-relative" : ""}`}>
              {slide.is3D && (
                <div className="wrap-btn-viewer">
                  <i className="icon-btn3d"></i>
                </div>
              )}
              <Image
                className="lazyload"
                data-src={slide.src}
                alt={""}
                src={slide.src}
                width={slide.width}
                height={slide.height}
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
            {images.map((slide, index) =>
              slide.isModel ? (
                <SwiperSlide className="swiper-slide" key={index}>
                  <div
                    className="item"
                    style={{
                      position: 'relative',
                      height: '100%',
                      width: '100%',
                      aspectRatio: '713 / 1070',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {/* Poster Resmi (Arkaplan) */}
                    {slide.src && slide.src !== "/images/placeholder.jpg" && (
                      <Image
                        className="lazyload"
                        data-src={slide.src}
                        alt={""}
                        src={slide.src}
                        width={slide.width}
                        height={slide.height}
                        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}

                    {/* Model Açma Butonu (Merkezde) */}
                    <button
                      onClick={() => openModelViewer(slide.modelSrc)}
                      style={{
                        zIndex: 20,
                        padding: '12px 24px',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(5px)'
                      }}
                    >
                      <i className="icon-btn3d" style={{ fontSize: '32px' }}></i>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>3D İncele</span>
                    </button>
                  </div>
                </SwiperSlide>
              ) : (
                <SwiperSlide className="swiper-slide" key={index}>
                  <Item original={slide.src} thumbnail={slide.src} width={slide.width} height={slide.height}>
                    {({ ref, open }) => (
                      <a onClick={open} className="item">
                        <Image
                          ref={ref}
                          className="tf-image-zoom lazyload"
                          data-zoom={slide.src}
                          data-src={slide.src}
                          alt="image"
                          src={slide.src}
                          width={slide.width}
                          height={slide.height}
                        />
                      </a>
                    )}
                  </Item>
                </SwiperSlide>
              )
            )}
            <div className="swiper-button-next button-style-arrow thumbs-next"></div>
            <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
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
        </div>
      </Gallery>
    </>
  );
}
