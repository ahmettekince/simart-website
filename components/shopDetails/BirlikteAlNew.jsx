"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function BirlikteAlNew({ variations = [], currentSlug = null, currentCategorySlug = "urunler" }) {
    const [activeIndex, setActiveIndex] = useState(0);
    if (!variations?.length) return null;

    return (
        <div style={{ marginBottom: 20, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Alternatifler</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" className="ba-prev" aria-label="Önceki">‹</button>
                    <span style={{ fontSize: 13, color: "#666", minWidth: 40, textAlign: "center" }}>{activeIndex + 1} / {variations.length}</span>
                    <button type="button" className="ba-next" aria-label="Sonraki">›</button>
                </div>
            </div>
            <div className="birlikte-al-viewport" style={{ overflow: "hidden", width: "100%", marginRight: 0 }}>
                <Swiper
                    className="birlikte-al-swiper"
                    modules={[Navigation]}
                    spaceBetween={12}
                    slidesPerView={1}
                    slidesPerGroup={1}
                    navigation={{ prevEl: ".ba-prev", nextEl: ".ba-next" }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    breakpoints={{
                        768: { slidesPerView: 1.15 }
                    }}
                >
                    {variations.map((v, i) => {
                        const cat = v.category_slug || "urunler";
                        const slug = v.slug || "";
                        const url = `/magaza/${cat}/${slug}`;
                        const price = v.price ?? 0;
                        const final = v.final_price ?? v.discount_price ?? v.price ?? 0;
                        const hasDiscount = final < price && price > 0;
                        const img = v.cover_image?.thumbnail_url || v.cover_image?.url || null;
                        return (
                            <SwiperSlide key={v.slug || v.name || i} className="birlikte-al-slide">
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 12, background: "#fff", overflow: "hidden", minHeight: 100 }}>
                                    {img && (
                                        <div style={{ width: 100, minWidth: 100, height: 100, flexShrink: 0, overflow: "hidden", background: "#f5f5f5" }}>
                                            <Image src={img} alt={v.cover_image?.alt_text || v.name || ""} width={120} height={120} unoptimized={String(img).startsWith("http")} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }} title={v.name}>{v.name}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: hasDiscount ? "#0bc15c" : "#3c81b5" }}>₺{Number(final).toLocaleString("tr-TR")}</span>
                                            {hasDiscount && <span style={{ fontSize: 13, color: "#999", textDecoration: "line-through" }}>₺{Number(price).toLocaleString("tr-TR")}</span>}
                                        </div>
                                    </div>
                                    <Link href={url} style={{ flexShrink: 0, minWidth: 90, margin: "0 12px", padding: "8px 16px", borderRadius: 8, background: "var(--primary, #6366f1)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Ürünü İncele</Link>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
            <style jsx>{`
        .ba-prev, .ba-next { width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; font-size: 20px; line-height: 1; color: #333; }
        .birlikte-al-swiper { width: 100% !important; }
        .birlikte-al-slide { height: auto; box-sizing: border-box; flex-shrink: 0; width: 100% !important; }
        @media (min-width: 768px) {
          .birlikte-al-viewport {  }
          .birlikte-al-slide { width: auto !important; }
        }
      `}</style>
        </div>
    );
}
