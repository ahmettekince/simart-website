"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import NavDotsPill from "@/components/common/NavDotsPill";

/**
 * Product image swiper component
 * @param {Object} props
 * @param {Array} props.images - Array of image objects with url and thumbnail_url
 * @param {string} props.productSlug - Product slug for link
 * @param {string} props.productName - Product name for alt text
 * @param {number} props.width - Image width (default: 360)
 * @param {number} props.height - Image height (default: 360)
 * @param {string} props.sizes - Responsive sizes for smaller download (e.g. "(max-width: 768px) 50vw, 320px")
 * @param {Array} props.campaignTags - Array of campaign tag image URLs
 * @param {string} props.categorySlug - Category slug for link (optional, defaults to "urunler")
 */
export default function ProductImageSwiper({
    images = [],
    productSlug,
    productName = "product",
    width = 360,
    height = 360,
    sizes = "(max-width: 480px) 50vw, (max-width: 768px) 33vw, 320px",
    campaignTags = [],
    categorySlug = "urunler",
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = useRef(null);

    // Helper to render campaign tags
    const renderCampaignTags = () => {
        if (!campaignTags || campaignTags.length === 0) return null;

        const positionCounters = { left: 0, center: 0, right: 0 };
        const renderTags = [];

        campaignTags.forEach((tag, index) => {
            const tagUrl = typeof tag === 'string'
                ? tag
                : (tag?.url || tag?.image_url || tag?.src || tag);

            if (!tagUrl || typeof tagUrl !== 'string') return;

            const position = (typeof tag === 'object' ? tag.position : null) || 'left';
            const counter = positionCounters[position];

            if (counter < 3) {
                let positionStyle = {};

                if (position === 'left') {
                    positionStyle = { left: '10px' };
                } else if (position === 'center') {
                    positionStyle = { left: '50%', transform: 'translateX(-50%)' };
                } else if (position === 'right') {
                    positionStyle = { right: '10px' };
                }

                renderTags.push({
                    url: tagUrl,
                    position: position,
                    style: {
                        position: 'absolute',
                        zIndex: 10,
                        '--tag-index': counter,
                        ...positionStyle,
                    },
                    key: `${position}-${counter}-${index}`,
                });

                positionCounters[position]++;
            }
        });

        return (
            <>
                {renderTags.map((tag) => (
                    <Link
                        key={tag.key}
                        href={`/magaza/${categorySlug}/${productSlug}`}
                        className="campaign-tag"
                        style={{
                            ...tag.style,
                            cursor: 'pointer',
                            display: 'block',
                        }}
                    >
                        <img
                            src={tag.url}
                            alt="Campaign Tag"
                            className="campaign-tag-img"
                        />
                    </Link>
                ))}
            </>
        );
    };

    if (!images || images.length === 0) {
        return (
            <div className="product-img">
                <img
                    className="img-product"
                    src="/images/products/product-1.jpg"
                    alt={productName}
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        width: '100%',
                        height: 'auto'
                    }}
                />
            </div>
        );
    }

    // Görsel URL'ini normalize et (string veya object olabilir)
    const getImageUrl = (image) => {
        if (typeof image === 'string') {
            return image;
        }
        if (image && typeof image === 'object') {
            return image.url || image.webp_url || image.src || image;
        }
        return image;
    };

    // Tek görsel varsa Swiper kullanma
    if (images.length === 1) {
        const imageUrl = getImageUrl(images[0]);

        return (
            <>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Link
                        href={`/magaza/${categorySlug}/${productSlug}`}
                        className="product-img no-hover-effect"
                        style={{
                            position: 'relative',
                            display: 'block',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <img
                            className="img-product"
                            src={imageUrl}
                            alt={productName}
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                width: '100%',
                                height: 'auto'
                            }}
                            loading="lazy"
                        />
                    </Link>
                    {renderCampaignTags()}
                </div>
                <style jsx global>{`
                    /* Campaign Tags Styling */
                    .campaign-tag {
                        --tag-height: 75px; 
                        --tag-gap: 10px;
                        --base-top: 10px;
                        
                        top: calc(var(--base-top) + (var(--tag-index) * (var(--tag-height) + var(--tag-gap))));
                    }
                    .campaign-tag-img {
                        max-width: 75px;
                        height: auto;
                        object-fit: contain;
                        transition: all 0.2s ease;
                    }

                    /* Mobile Responsiveness for Tags */
                    @media (max-width: 768px) {
                        .campaign-tag {
                            --tag-height: 50px;
                            --tag-gap: 5px;
                        }
                        .campaign-tag-img {
                            max-width: 50px;
                            width: auto;
                            max-height: 50px; 
                        }
                    }

                    .no-hover-effect .img-product,
                    .no-hover-effect:hover .img-product,
                    .card-product-wrapper:hover .no-hover-effect .img-product {
                        opacity: 1 !important;
                    }
                `}</style>
            </>
        );
    }

    return (
        <>
            <div className="product-img-swiper position-relative no-hover-effect">
                <Swiper
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    modules={[Pagination, Navigation]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    pagination={false}
                    onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                    className="product-images-swiper"
                >
                    {images.map((image, index) => {
                        const imageUrl = getImageUrl(image);
                        return (
                            <SwiperSlide key={index}>
                                <Link href={`/magaza/${categorySlug}/${productSlug}`} className="product-img">
                                    <img
                                        className="img-product"
                                        src={imageUrl}
                                        alt={`${productName} - ${index + 1}`}
                                        style={{
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                            width: '100%',
                                            height: 'auto'
                                        }}
                                        loading="lazy"
                                    />
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {renderCampaignTags()}

                {images.length > 1 && (
                    <div className="product-images-swiper__nav-dots">
                        <NavDotsPill
                            total={images.length}
                            activeIndex={currentIndex}
                            onDotClick={(i) => swiperRef.current?.slideToLoop(i)}
                            ariaLabel="Ürün görselleri"
                        />
                    </div>
                )}
            </div>
            <style jsx global>{`
                /* Campaign Tags Styling - Duplicate for Swiper version since JSX Styles are scoped or need to be global for this usage */
               .campaign-tag {
                    --tag-height: 75px; 
                    --tag-gap: 10px;
                    --base-top: 10px;
                    
                    top: calc(var(--base-top) + (var(--tag-index) * (var(--tag-height) + var(--tag-gap))));
                }
                .campaign-tag-img {
                    max-width: 75px !important;
                    height: auto;
                    object-fit: contain;
                    transition: all 0.2s ease;
                }

                /* Mobile Responsiveness for Tags */
                @media (max-width: 768px) {
                    .campaign-tag {
                        --tag-height: 50px;
                        --tag-gap: 5px;
                    }
                    .campaign-tag-img {
                       max-width: 50px !important;
                       width: auto !important;
                       max-height: 50px !important;
                    }
                }

                .no-hover-effect .img-product,
                .no-hover-effect:hover .img-product,
                .card-product-wrapper:hover .no-hover-effect .img-product {
                    opacity: 1 !important;
                }
                /* Nav dots: fotoğrafın üzerinde, altta ve ortada */
                .product-images-swiper__nav-dots {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 20;
                    pointer-events: none;
                }
                .product-images-swiper__nav-dots .nav-dots-pill {
                    pointer-events: auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .product-images-swiper .swiper-pagination {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translate3d(-50%, 0, 20px);
                    z-index: 50;
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    width: auto !important;
                }
                .product-images-swiper .swiper-pagination-bullet {
                    width: 6px !important;
                    height: 6px !important;
                    background-color: #f5f5f5 !important;
                    opacity: 1 !important;
                    border-radius: 50% !important;
                    transition: all 0.3s ease !important;
                    margin: 0 3px !important;
                }
                .product-images-swiper .swiper-pagination-bullet-active {
                    width: 24px !important;
                    height: 6px !important;
                    background-color: #3c81b5 !important;
                    border-radius: 3px !important;
                }
            `}</style>
        </>
    );
}
