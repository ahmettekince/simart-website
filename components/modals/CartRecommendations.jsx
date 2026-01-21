"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useCartStore } from "@/stores/cartStore";

/**
 * Cart modal içinde "Şunları da beğenebilirsiniz" alanı.
 * İleride API'den sepet-özel öneri listesi gelince sadece burası/props değişecek.
 */
export default function CartRecommendations({ title = "Şunları da beğenebilirsiniz", products = [], maxItems = 10 }) {
  const items = Array.isArray(products) ? products.slice(0, maxItems) : [];
  if (items.length === 0) return null;

  const paginationClass = "spdsc1"; // Sabit class - sadece bir instance olduğu için

  return (
    <div className="tf-minicart-recommendations">
      <div className="tf-minicart-recommendations-heading">
        <div className="tf-minicart-recommendations-title">{title}</div>
        <div className={`sw-dots small style-2 cart-slide-pagination ${paginationClass}`} />
      </div>
      <Swiper
        dir="ltr"
        modules={[Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        pagination={{
          clickable: true,
          el: `.${paginationClass}`,
        }}
        className="swiper tf-cart-slide"
      >
        {items.map((product, i) => (
          <SwiperSlide key={product?.id ?? i} className="swiper-slide">
            <RecommendationItem product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function RecommendationItem({ product }) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const title = product?.name || product?.title || "";
  const finalPrice = product?.discount_price || product?.price || 0;

  const getCategorySlug = () => {
    // Sepetteki ürün yapısı: item.product?.categories veya item.product?.primary_category
    const categories = product?.product?.categories || product?.categories;
    if (categories && categories.length > 0) {
      const category = categories[0];
      if (category.slug) return category.slug;
      if (category.name) {
        return category.name
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
    }
    // Fallback: primary_category
    if (product?.product?.primary_category?.slug) {
      return product.product.primary_category.slug;
    }
    return "urunler";
  };

  const categorySlug = getCategorySlug();
  const productSlug = product?.slug || product?.id;
  const productUrl = `/magaza/${categorySlug}/${productSlug}`;

  const imageUrl =
    product?.image ||
    product?.imgSrc ||
    product?.product?.cover_image?.url ||
    product?.cover_image?.url ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/images/placeholder.jpg";

  const handleAddToCart = async () => {
    if (isAdding || showSuccess) return;
    setIsAdding(true);
    try {
      await addItem(product, 1, false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Önerilen ürünü sepete eklerken hata:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="tf-minicart-recommendations-item">
      <div className="tf-minicart-recommendations-item-image">
        <Link href={productUrl}>
          <Image alt={title || "Ürün"} src={imageUrl} width={720} height={1005} />
        </Link>
      </div>
      <div className="tf-minicart-recommendations-item-infos flex-grow-1">
        <Link className="title" href={productUrl}>
          {title}
        </Link>
        <div className="price">₺{Number(finalPrice || 0).toLocaleString("tr-TR")}</div>
        <div className="tf-minicart-recommendations-actions">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || showSuccess}
            className={`btn-add-cart-recommendation ${showSuccess ? "success" : ""}`}
          >
            {showSuccess ? "Eklendi" : isAdding ? "..." : "Sepete Ekle"}
          </button>
        </div>
      </div>
      <style jsx>{`
        .tf-minicart-recommendations-actions {
          margin-top: 6px;
        }
        .btn-add-cart-recommendation {
          height: 28px;
          padding: 0 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid #3c81b5;
          background: #3c81b5;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }
        .btn-add-cart-recommendation:hover:not(:disabled) {
          border-color: #2d6a9a;
          background: #2d6a9a;
        }
        .btn-add-cart-recommendation:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-add-cart-recommendation.success {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }
        .btn-add-cart-recommendation.success:hover {
          background: #059669;
          border-color: #059669;
        }
      `}</style>
    </div>
  );
}
