"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import NavDotsPill from "@/components/common/NavDotsPill";
import { useCartStore } from "@/stores/cartStore";

/**
 * Sepet üstünde gösterilen cross-sale / öneriler alanı.
 * - cross_sale_campaigns varsa: API'den gelen kampanya target ürünleri listeler
 * - products prop'u varsa: Direkt ürün listesi gösterilir (İlginizi çekebilecekler için)
 * - Sadece sepette source olan kampanyalar gösterilir
 * - Target ürünler ID bazında tekrarsızdır
 * - Sepette zaten olan target ürünler listelenmez
 */
export default function BirlikteAlSepet({ title = "Sepetinize ekleyebilirsiniz", products = [] }) {
  const cross_sale_campaigns = useCartStore((state) => state.cross_sale_campaigns);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addingSlug, setAddingSlug] = useState(null);

  const cartProductIds = useMemo(() => {
    const ids = new Set();
    items.forEach((item) => {
      if (item?.is_gift) return;
      const id = item?.productId ?? item?.product?.id ?? item?.id;
      if (id != null) ids.add(Number(id));
    });
    return ids;
  }, [items]);

  const targetProducts = useMemo(() => {
    // Eğer products prop'u varsa direkt onu kullan (İlginizi çekebilecekler için)
    if (Array.isArray(products) && products.length > 0) {
      const seen = new Set();
      return products.filter((p) => {
        const id = p?.id || p?.product?.id;
        if (!id) return false;
        const numId = Number(id);
        if (seen.has(numId) || cartProductIds.has(numId)) return false;
        seen.add(numId);
        return true;
      }).map((p) => {
        const cat = p?.category_slug || p?.product?.categories?.[0]?.slug || p?.product?.primary_category?.slug || "urunler";
        return {
          id: p?.id || p?.product?.id,
          name: p?.name || p?.title || "",
          slug: p?.slug || p?.product?.slug || "",
          price: p?.price ?? p?.product?.price ?? 0,
          final_price: p?.final_price ?? p?.discount_price ?? p?.price ?? p?.product?.final_price ?? p?.product?.discount_price ?? p?.product?.price ?? 0,
          cover_image: p?.cover_image || p?.product?.cover_image,
          category_slug: cat,
        };
      });
    }

    // Cross-sale campaigns kullan
    if (!Array.isArray(cross_sale_campaigns) || cross_sale_campaigns.length === 0) return [];

    const seen = new Set();
    const list = [];

    cross_sale_campaigns.forEach((c) => {
      const sourceId = c?.source_product?.id != null ? Number(c.source_product.id) : null;
      if (sourceId == null || !cartProductIds.has(sourceId)) return;

      const t = c?.target_product;
      if (!t || !t.id) return;

      const targetId = Number(t.id);
      if (seen.has(targetId)) return;
      if (cartProductIds.has(targetId)) return;

      seen.add(targetId);
      list.push({
        id: targetId,
        name: t.name || "",
        slug: t.slug || "",
        price: t.price ?? 0,
        final_price: t.final_price ?? t.discount_price ?? t.price ?? 0,
        cover_image: t.cover_image,
        category_slug: t.category_slug || t.primary_category?.slug || "urunler",
      });
    });

    return list;
  }, [cross_sale_campaigns, cartProductIds, products]);

  const handleAddToCart = async (target) => {
    if (addingSlug || !target?.slug) return;

    const product = {
      id: target.id,
      slug: target.slug,
      name: target.name,
      price: target.final_price,
      cover_image: target.cover_image,
    };

    setAddingSlug(target.slug);
    try {
      await addItem(product, 1, true);
    } catch (e) {
      console.error("Cross-sale sepete ekleme hatası:", e);
    } finally {
      setAddingSlug(null);
    }
  };

  if (targetProducts.length === 0) return null;

  return (
    <div className="birlikte-al-sepet" style={{ marginBottom: 4, width: "100%", maxWidth: "100%", minWidth: 0, }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, minWidth: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        {targetProducts.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <NavDotsPill
              total={targetProducts.length}
              activeIndex={activeIndex}
              onDotClick={(i) => swiperRef.current?.slideTo?.(i)}
              ariaLabel="Birlikte al önerileri"
            />
          </div>
        )}
      </div>

      <div style={{ overflow: "hidden", width: "100%", maxWidth: "100%", minWidth: 0, marginRight: 0 }}>
        <Swiper
          key={`ba-sepet-${targetProducts.length}`}
          modules={[Autoplay]}
          spaceBetween={12}
          slidesPerView={1}
          slidesPerGroup={1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={
            targetProducts.length > 1
              ? { delay: 5000, disableOnInteraction: false }
              : false
          }
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          breakpoints={{
            // Tek ürün tam genişlik dolsun diye 2+ ürün varken 1.15
            768: { slidesPerView: targetProducts.length === 1 ? 1 : 1.15 },
          }}
          style={{ width: "100%", maxWidth: "100%" }}
        >
          {targetProducts.map((t, i) => {
            const cat = t.category_slug || "urunler";
            const slug = t.slug || "";
            const url = `/magaza/${cat}/${slug}`;
            const price = t.price ?? 0;
            const final = t.final_price ?? 0;
            const hasDiscount = final < price && price > 0;
            const img = t.cover_image?.thumbnail_url || t.cover_image?.url || t.image || t.imgSrc || t.product?.cover_image?.thumbnail_url || t.product?.cover_image?.url || null;
            const isAdding = addingSlug === t.slug;

            return (
              <SwiperSlide key={t.id || i} style={{ height: "auto", boxSizing: "border-box", width: "100%", maxWidth: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 12, background: "#fff", overflow: "hidden", minHeight: 100, width: "100%", maxWidth: "100%", boxSizing: "border-box", paddingLeft: 12, paddingRight: 12 }}>
                  {img ? (
                    <div style={{ width: 72, minWidth: 72, height: 72, flexShrink: 0, overflow: "hidden", background: "#f5f5f5" }}>
                      <Image
                        src={img}
                        alt={t.cover_image?.alt_text || t.name || ""}
                        width={80}
                        height={80}
                        unoptimized={String(img).startsWith("http")}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: 72, minWidth: 72, height: 72, flexShrink: 0, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>
                      Görsel yok
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                    <Link
                      href={url}
                      style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, textDecoration: "none" }}
                      title={t.name}
                    >
                      {t.name}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: hasDiscount ? "#0bc15c" : "#3c81b5" }}>{Number(final).toLocaleString("tr-TR")} TL</span>
                      {hasDiscount && <span style={{ fontSize: 13, color: "#999", textDecoration: "line-through" }}>{Number(price).toLocaleString("tr-TR")} TL</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddToCart(t)}
                    style={{
                      flexShrink: 0,
                      minWidth: 80,
                      margin: "0 0 0 8px",
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "var(--primary, #3c81b5)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: isAdding ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isAdding ? 0.8 : 1,
                    }}
                  >
                    {isAdding ? "Ekleniyor..." : "Sepete Ekle"}
                  </button>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

