"use client";
import { useMemo, useRef, useCallback, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Virtual } from "swiper/modules";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";

const translations = {
    tr: {
        title: "İlginizi Çekebilir"
    },
    en: {
        title: "You might be interested in"
    }
};

const VIRTUAL_THRESHOLD = 16;
const LOOP_MAX = 12;

const CarouselProductCard = memo(function CarouselProductCard({
    product,
    index,
    initialGalleryActive,
    onGalleryActivate,
}) {
    return (
        <ProductCardSimart
            product={product}
            isPriority={index < 8}
            lazyGallery
            carouselMode
            initialGalleryActive={initialGalleryActive}
            onGalleryActivate={onGalleryActivate}
        />
    );
});

export default function ProductsClient({ products = [], lang = "tr" }) {
    const t = translations[lang] || translations.tr;
    const displayProducts = Array.isArray(products) ? products : [];
    const useVirtual = displayProducts.length >= VIRTUAL_THRESHOLD;
    const canLoop = displayProducts.length > 1 && displayProducts.length <= LOOP_MAX && !useVirtual;
    const activatedGalleryRef = useRef(new Set());

    const swiperModules = useMemo(
        () => (useVirtual ? [Autoplay, Virtual] : [Autoplay]),
        [useVirtual]
    );

    const virtualConfig = useMemo(
        () => (useVirtual ? { enabled: true, addSlidesBefore: 2, addSlidesAfter: 2 } : undefined),
        [useVirtual]
    );

    const handleGalleryActivate = useCallback((productId) => {
        if (productId != null) {
            activatedGalleryRef.current.add(productId);
        }
    }, []);

    if (displayProducts.length === 0) return null;

    return (
        <section className="flat-spacing-19">
            <div className="container">
                <div className="flat-title px-0">
                    <span className="title wow fadeInUp" data-wow-delay="0s" suppressHydrationWarning={true}>
                        {t.title}
                    </span>
                </div>
                <div className="sw-pagination-wrapper products-pagination-wrapper">
                    <Swiper
                        dir="ltr"
                        spaceBetween={10}
                        slidesPerView={2}
                        loop={canLoop}
                        virtual={virtualConfig}
                        grabCursor
                        touchEventsTarget="container"
                        speed={600}
                        watchSlidesProgress
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        breakpoints={{
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                        modules={swiperModules}
                        className="simple-products-slider"
                    >
                        {displayProducts.map((product, index) => {
                            const productId = product.id || index;

                            return (
                                <SwiperSlide
                                    key={productId}
                                    virtualIndex={index}
                                    className="height-auto"
                                >
                                    <CarouselProductCard
                                        product={product}
                                        index={index}
                                        initialGalleryActive={activatedGalleryRef.current.has(productId)}
                                        onGalleryActivate={() => handleGalleryActivate(productId)}
                                    />
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
