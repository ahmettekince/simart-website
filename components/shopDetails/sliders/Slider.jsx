"use client";
import Drift from "drift-zoom";
import { useEffect, useRef, useState, forwardRef, useCallback, useMemo } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Gallery, Item } from "react-photoswipe-gallery";
import NavDotsPill from "@/components/common/NavDotsPill";
import OverlayCtaButton, { Model3dIcon, PlayIcon, ArrowIcon } from "@/components/common/OverlayCtaButton";

function resolveImageSources(img) {
  if (typeof img === "string") {
    return { displaySrc: img, fullSrc: img };
  }

  const fullSrc = img?.url || img?.webp_url || img?.src || "";
  const displaySrc = img?.thumbnail_url || fullSrc;

  return { displaySrc, fullSrc };
}

const SliderImage = forwardRef(function SliderImage(
  {
    className,
    src,
    alt,
    width,
    height,
    style,
    priority = false,
    "data-zoom": dataZoom,
  },
  ref
) {
  const setImgRef = useCallback((node) => {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <img
      ref={setImgRef}
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={style}
      data-zoom={dataZoom}
      loading="eager"
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
});

export default function Slider({
  currentColor = "Beige",
  handleColor = () => { },
  galleryImages = [],
  product = {},
  onOpenModel3d = () => { },
  onOpenVideo = () => { },
  pageKeywords = "",
}) {
  const pName = product.name || product.title || "";
  const dynamicAlt = pName
    ? (pageKeywords ? `${pName} - ${pageKeywords}` : `${pName} - Şımart Teknoloji`)
    : "Şımart Teknoloji";

  const images = useMemo(() => {
    const normalized = Array.isArray(galleryImages)
      ? galleryImages
        .map((img, index) => {
          const { displaySrc, fullSrc } = resolveImageSources(img);
          if (!fullSrc) return null;

          return {
            id: index + 1,
            displaySrc,
            fullSrc,
            alt: dynamicAlt,
            width: typeof img === "object" ? img?.width || 770 : 770,
            height: typeof img === "object" ? img?.height || 1075 : 1075,
            dataValue: currentColor?.toLowerCase?.() || "beige",
          };
        })
        .filter(Boolean)
      : [];

    if (normalized.length > 0) {
      return normalized;
    }

    return [
      {
        id: 1,
        displaySrc: "/images/placeholder.jpg",
        fullSrc: "/images/placeholder.jpg",
        alt: dynamicAlt,
        width: 770,
        height: 1075,
        dataValue: currentColor?.toLowerCase?.() || "beige",
      },
    ];
  }, [galleryImages, dynamicAlt, currentColor]);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const swiperRef = useRef(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urls = new Set();
    images.forEach(({ displaySrc, fullSrc }) => {
      if (displaySrc) urls.add(displaySrc);
      if (fullSrc) urls.add(fullSrc);
    });

    urls.forEach((url) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    });
  }, [images]);

  const handleSlideChange = (swiper) => {
    const idx = swiper.realIndex ?? swiper.activeIndex;
    setActiveSlideIndex(idx);
    handleColor(images[idx]?.dataValue);
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(idx, 300);
    }
  };

  useEffect(() => {
    const match = images.find((elm) => elm.dataValue.toLowerCase() === currentColor.toLowerCase());
    if (match && swiperRef.current) {
      swiperRef.current.slideTo(match.id - 1);
    }
  }, [currentColor, images]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@google/model-viewer");
    }
  }, []);

  const driftInstancesRef = useRef([]);

  useEffect(() => {
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

    return () => {
      zoomElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
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
      if (typeof document !== "undefined") {
        document.querySelectorAll(".drift-zoom-pane, .drift-bounding-box, .zoom-magnifier-containing .drift-zoom-pane").forEach((el) => el.remove());
        document.querySelectorAll(".section-image-zoom").forEach((el) => el.classList.remove("zoom-active"));
      }
    };
  }, [images]);

  return (
    <>
      <Swiper
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={5}
        loop={images.length > 1}
        className="swiper tf-product-media-thumbs other-image-zoom"
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        allowTouchMove
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
              <img
                alt={slide.alt}
                src={slide.displaySrc}
                width={slide.width}
                height={slide.height}
                loading="eager"
                decoding="async"
                style={{ objectFit: "contain", width: "100%", height: "auto", display: "block" }}
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
            loop={images.length > 1}
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
                <Item
                  original={slide.fullSrc}
                  thumbnail={slide.displaySrc}
                  width={slide.width}
                  height={slide.height}
                >
                  {({ ref, open }) => (
                    <a onClick={open} className="item" style={{ border: "2px solid #f5f5f5", borderRadius: "8px", position: "relative", display: "block", height: "100%" }}>
                      <SliderImage
                        ref={ref}
                        className="tf-image-zoom"
                        data-zoom={slide.fullSrc}
                        alt={slide.alt}
                        src={slide.displaySrc}
                        width={slide.width}
                        height={slide.height}
                        style={{ objectFit: "contain", width: "100%", height: "100%" }}
                        priority={index === 0}
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
                onDotClick={(i) => swiperRef.current?.slideToLoop?.(i) ?? swiperRef.current?.slideTo?.(i)}
                ariaLabel="Ürün görselleri"
              />
            </div>
          )}
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
