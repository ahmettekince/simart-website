"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import NavDotsPill from "@/components/common/NavDotsPill";

const FALLBACK_IMAGE = "/images/products/product-1.jpg";

const IMAGE_STYLE = {
    objectFit: "contain",
    objectPosition: "center",
    width: "100%",
    height: "auto",
    display: "block",
};

const SINGLE_IMAGE_LINK_STYLE = {
    position: "relative",
    display: "block",
    width: "100%",
};

function getImageUrl(image) {
    if (typeof image === "string") return image;
    if (image && typeof image === "object") {
        return image.url || image.webp_url || image.src || null;
    }
    return null;
}

function getTagUrl(tag) {
    if (typeof tag === "string") return tag;
    if (tag && typeof tag === "object") {
        const url = tag.url || tag.image_url || tag.src;
        return typeof url === "string" ? url : null;
    }
    return null;
}

function CampaignTags({ tags, productHref, onLinkClick }) {
    if (!tags?.length) return null;

    const positionCounters = { left: 0, center: 0, right: 0 };
    const items = [];

    tags.forEach((tag, index) => {
        const tagUrl = getTagUrl(tag);
        if (!tagUrl) return;

        const position = (typeof tag === "object" ? tag.position : null) || "left";
        const counter = positionCounters[position];
        if (counter >= 3) return;

        let positionStyle = {};
        if (position === "left") {
            positionStyle = { left: "10px" };
        } else if (position === "center") {
            positionStyle = { left: "50%", transform: "translateX(-50%)" };
        } else if (position === "right") {
            positionStyle = { right: "10px" };
        }

        items.push(
            <Link
                key={`${position}-${counter}-${index}`}
                href={productHref}
                onClick={onLinkClick}
                className="campaign-tag"
                style={{
                    position: "absolute",
                    zIndex: 10,
                    "--tag-index": counter,
                    display: "block",
                    ...positionStyle,
                }}
            >
                <img
                    src={tagUrl}
                    alt="Campaign Tag"
                    className="campaign-tag-img"
                    loading="lazy"
                />
            </Link>
        );

        positionCounters[position]++;
    });

    return items;
}

function ProductImageLink({
    href,
    src,
    alt,
    width,
    height,
    isPriority,
    onLinkClick,
    className = "product-img",
    style,
}) {
    return (
        <Link href={href} onClick={onLinkClick} className={className} style={style}>
            <img
                className="img-product"
                src={src}
                alt={alt}
                width={width}
                height={height}
                style={IMAGE_STYLE}
                loading={isPriority ? "eager" : "lazy"}
                fetchPriority={isPriority ? "high" : undefined}
            />
        </Link>
    );
}

function ProductImageFrame({ productHref, onLinkClick, campaignTags, children }) {
    return (
        <div style={{ position: "relative", width: "100%" }}>
            {children}
            <CampaignTags tags={campaignTags} productHref={productHref} onLinkClick={onLinkClick} />
        </div>
    );
}

export default function ProductImageSwiper({
    images = [],
    productSlug,
    productName = "product",
    width = 360,
    height = 360,
    campaignTags = [],
    categorySlug = "urunler",
    isPriority = false,
    detailUrl = null,
    onLinkClick = null,
    lazyGallery = false,
    carouselMode = false,
    initialGalleryActive = false,
    onGalleryActivate = null,
}) {
    const containerRef = useRef(null);
    const swiperRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [galleryActive, setGalleryActive] = useState(
        !lazyGallery || initialGalleryActive
    );

    const productHref = detailUrl || `/magaza/${categorySlug}/${productSlug}`;
    const useLoop = !lazyGallery && !carouselMode;

    useEffect(() => {
        if (initialGalleryActive) {
            setGalleryActive(true);
        }
    }, [initialGalleryActive]);

    useEffect(() => {
        if (!lazyGallery || galleryActive) return;

        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setGalleryActive(true);
                    onGalleryActivate?.();
                    observer.disconnect();
                }
            },
            { rootMargin: "250px 0px", threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [lazyGallery, galleryActive, onGalleryActivate]);

    const handleDotClick = (index) => {
        if (useLoop) {
            swiperRef.current?.slideToLoop?.(index);
        } else {
            swiperRef.current?.slideTo?.(index);
        }
    };

    if (images.length === 0) {
        return (
            <ProductImageFrame productHref={productHref} onLinkClick={onLinkClick} campaignTags={campaignTags}>
                <ProductImageLink
                    href={productHref}
                    src={FALLBACK_IMAGE}
                    alt={productName}
                    width={width}
                    height={height}
                    isPriority={isPriority}
                    onLinkClick={onLinkClick}
                    className="product-img no-hover-effect"
                    style={SINGLE_IMAGE_LINK_STYLE}
                />
            </ProductImageFrame>
        );
    }

    if (images.length === 1) {
        const imageUrl = getImageUrl(images[0]) || FALLBACK_IMAGE;

        return (
            <ProductImageFrame productHref={productHref} onLinkClick={onLinkClick} campaignTags={campaignTags}>
                <ProductImageLink
                    href={productHref}
                    src={imageUrl}
                    alt={productName}
                    width={width}
                    height={height}
                    isPriority={isPriority}
                    onLinkClick={onLinkClick}
                    className="product-img no-hover-effect"
                    style={SINGLE_IMAGE_LINK_STYLE}
                />
            </ProductImageFrame>
        );
    }

    const showPreview = lazyGallery && !galleryActive;
    const previewUrl = getImageUrl(images[0]) || FALLBACK_IMAGE;

    return (
        <div
            ref={lazyGallery ? containerRef : undefined}
            className="product-img-swiper position-relative no-hover-effect"
        >
            {showPreview ? (
                <ProductImageFrame productHref={productHref} onLinkClick={onLinkClick} campaignTags={campaignTags}>
                    <ProductImageLink
                        href={productHref}
                        src={previewUrl}
                        alt={productName}
                        width={width}
                        height={height}
                        isPriority={isPriority}
                        onLinkClick={onLinkClick}
                        className="product-img no-hover-effect"
                        style={SINGLE_IMAGE_LINK_STYLE}
                    />
                </ProductImageFrame>
            ) : (
                <>
                    <Swiper
                        nested
                        touchReleaseOnEdges
                        onSwiper={(swiper) => { swiperRef.current = swiper; }}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={useLoop}
                        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                        className="product-images-swiper"
                    >
                        {images.map((image, index) => (
                            <SwiperSlide key={index}>
                                <ProductImageLink
                                    href={productHref}
                                    src={getImageUrl(image) || FALLBACK_IMAGE}
                                    alt={productName}
                                    width={width}
                                    height={height}
                                    isPriority={isPriority && index === 0}
                                    onLinkClick={onLinkClick}
                                    style={{ display: "block", width: "100%" }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <CampaignTags tags={campaignTags} productHref={productHref} onLinkClick={onLinkClick} />
                </>
            )}

            <div className="product-images-swiper__nav-dots">
                <NavDotsPill
                    total={images.length}
                    activeIndex={showPreview ? 0 : currentIndex}
                    onDotClick={showPreview ? () => {} : handleDotClick}
                    ariaLabel="Ürün görselleri"
                />
            </div>
        </div>
    );
}
