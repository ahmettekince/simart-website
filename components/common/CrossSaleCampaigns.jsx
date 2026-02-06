"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import { useCartStore } from "@/stores/cartStore";
import { openCartModal } from "@/utils/openCartModal";

/**
 * Cross-sale kampanyalarından target ürünleri listeler; sepette ve /sepetim üstünde gösterilir.
 * Sadece sepette kaynak ürün (source) olan kampanyaların target'ları gösterilir. Birden fazla target kaydırarak görülür.
 */
export default function CrossSaleCampaigns() {
  const cross_sale_campaigns = useCartStore((state) => state.cross_sale_campaigns);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const [activeIndex, setActiveIndex] = useState(0);
  const [addingSlug, setAddingSlug] = useState(null);

  // Sepetteki ürün ID'leri (sadece normal ürünler, hediye hariç)
  const cartProductIds = useMemo(() => {
    const ids = new Set();
    items.forEach((item) => {
      if (item.is_gift) return;
      const id = item.productId ?? item.product?.id ?? item.id;
      if (id != null) ids.add(Number(id));
    });
    return ids;
  }, [items]);

  // Sadece sepette source olan kampanyaların target'ları; target ID'ye göre tekrarsız
  const targetProducts = useMemo(() => {
    if (!Array.isArray(cross_sale_campaigns) || cross_sale_campaigns.length === 0) return [];
    const seen = new Set();
    const list = [];
    cross_sale_campaigns.forEach((c) => {
      const sourceId = c?.source_product?.id != null ? Number(c.source_product.id) : null;
      if (sourceId == null || !cartProductIds.has(sourceId)) return;
      const t = c?.target_product;
      if (!t || !t.id || seen.has(t.id)) return;
      if (cartProductIds.has(Number(t.id))) return;
      seen.add(t.id);
      list.push({
        id: t.id,
        name: t.name || "",
        slug: t.slug || "",
        price: t.price ?? 0,
        final_price: t.final_price ?? t.discount_price ?? t.price ?? 0,
        cover_image: t.cover_image,
        category_slug: t.category_slug || t.primary_category?.slug || "urunler",
      });
    });
    return list;
  }, [cross_sale_campaigns, cartProductIds]);

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
      const result = await addItem(product, 1, true);
      if (result?.added) openCartModal();
    } catch (e) {
      console.error("Cross-sale sepete ekleme hatası:", e);
    } finally {
      setAddingSlug(null);
    }
  };

  if (targetProducts.length === 0) return null;

  return (
    <div className="cross-sale-campaigns" style={{ marginBottom: 20, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Sepetinize ekleyebilirsiniz</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="cs-prev"
            aria-label="Önceki"
            style={{ width: 32, height: 32, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "#333", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >‹</button>
          <span style={{ fontSize: 13, color: "#666", minWidth: 40, textAlign: "center" }}>{activeIndex + 1} / {targetProducts.length}</span>
          <button
            type="button"
            className="cs-next"
            aria-label="Sonraki"
            style={{ width: 32, height: 32, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "#333", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >›</button>
        </div>
      </div>
      <div style={{ overflow: "hidden", width: "100%" }}>
        <Swiper
          style={{ width: "100%" }}
          modules={[Navigation]}
          spaceBetween={12}
          slidesPerView={1}
          slidesPerGroup={1}
          navigation={{ prevEl: ".cs-prev", nextEl: ".cs-next" }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          breakpoints={{
            768: { slidesPerView: 1.15 },
          }}
        >
          {targetProducts.map((t, i) => {
            const img = t.cover_image?.thumbnail_url || t.cover_image?.url || null;
            const price = t.price ?? 0;
            const final = t.final_price ?? 0;
            const hasDiscount = final < price && price > 0;
            const url = `/magaza/${t.category_slug}/${t.slug}`;
            const isAdding = addingSlug === t.slug;

            return (
              <SwiperSlide key={t.id || i} style={{ height: "auto", boxSizing: "border-box", flexShrink: 0, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 12, background: "#fff", overflow: "hidden", minHeight: 100 }}>
                  {img ? (
                    <div style={{ width: 100, minWidth: 100, height: 100, flexShrink: 0, overflow: "hidden", background: "#f5f5f5" }}>
                      <Image src={img} alt={t.name} width={120} height={120} unoptimized={String(img).startsWith("http")} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    </div>
                  ) : (
                    <div style={{ width: 100, minWidth: 100, height: 100, flexShrink: 0, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>Görsel yok</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                    <Link href={url} style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, textDecoration: "none" }} title={t.name}>{t.name}</Link>
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
                      minWidth: 90,
                      margin: "0 12px",
                      padding: "8px 16px",
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
