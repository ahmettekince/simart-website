"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import NavDotsPill from "@/components/common/NavDotsPill";
import { useCartStore } from "@/stores/cartStore";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import ErrorToast from "@/components/common/ErrorToast";
import { useLangStore } from "@/stores/langStore";

/**
 * Sepet üstünde gösterilen cross-sale / öneriler alanı.
 * - cross_sale_campaigns varsa: API'den gelen kampanya target ürünleri listeler
 * - products prop'u varsa: Direkt ürün listesi gösterilir (İlginizi çekebilecekler için)
 * - Sadece sepette source olan kampanyalar gösterilir
 * - Target ürünler ID bazında tekrarsızdır
 * - Sepette zaten olan target ürünler listelenmez
 */
export default function BirlikteAlSepet({ title, products = [] }) {
  const cross_sale_campaigns = useCartStore((state) => state.cross_sale_campaigns);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const lang = useLangStore((state) => state.lang);

  const t = {
    tr: {
      defaultTitle: "Sepetinize ekleyebilirsiniz",
      addToCart: "Sepete Ekle",
      adding: "Ekleniyor...",
      noImage: "Görsel yok",
      ariaLabel: "Birlikte al önerileri",
      errorAdd: "Sepete eklenirken bir hata oluştu.",
      systemError: "Sistemsel bir hata oluştu.",
      locale: "tr-TR"
    },
    en: {
      defaultTitle: "You can add to your cart",
      addToCart: "Add to Cart",
      adding: "Adding...",
      noImage: "No image",
      ariaLabel: "Buy together suggestions",
      errorAdd: "An error occurred while adding to cart.",
      systemError: "A system error occurred.",
      locale: "en-US"
    }
  }[lang] || {
    defaultTitle: "Sepetinize ekleyebilirsiniz",
    addToCart: "Sepete Ekle",
    adding: "Ekleniyor...",
    noImage: "Görsel yok",
    ariaLabel: "Birlikte al önerileri",
    errorAdd: "Sepete eklenirken bir hata oluştu.",
    systemError: "Sistemsel bir hata oluştu.",
    locale: "tr-TR"
  };

  const displayTitle = title || t.defaultTitle;

  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addingSlug, setAddingSlug] = useState(null);
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [maxQuantityForToast, setMaxQuantityForToast] = useState(null);
  const [isStockLimitForToast, setIsStockLimitForToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("");

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
        // Stokta olmayan ürünleri önermeyiz
        const inStock = p?.is_in_stock ?? p?.product?.is_in_stock ?? true;
        if (!inStock) return false;
        seen.add(numId);
        return true;
      }).map((p) => {
        const targetCategory = p?.categories?.[0] || p?.product?.categories?.[0] || p?.primary_category || p?.product?.primary_category || {};
        const catNameFromSlug = (p?.category_slug || p?.product?.category_slug || p?.categories?.[0]?.slug || p?.product?.categories?.[0]?.slug || "Akıllı Ürünler")
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const catName = targetCategory.name || targetCategory.title || catNameFromSlug;
        const catSlug = p?.category_slug || p?.product?.category_slug || targetCategory.slug || p?.categories?.[0]?.slug || p?.product?.categories?.[0]?.slug || "urunler";

        return {
          id: p?.id || p?.product?.id,
          name: p?.name || p?.title || "",
          slug: p?.slug || p?.product?.slug || "",
          price: p?.price ?? p?.product?.price ?? 0,
          final_price: p?.final_price ?? p?.discount_price ?? p?.price ?? p?.product?.final_price ?? p?.product?.discount_price ?? p?.product?.price ?? 0,
          cover_image: p?.cover_image || p?.product?.cover_image,
          categories: p?.categories || p?.product?.categories || [],
          category_slug: catSlug,
          category_name: catName,
          item_category: catName,
          is_pre_order: p?.is_pre_order || p?.product?.is_pre_order || false,
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
      // Stokta olmayan ürünleri önermeyiz
      const inStock = t.is_in_stock ?? true;
      if (!inStock) return;

      const targetCategory = t.categories?.[0] || t.primary_category || t.item_category || {};
      const catNameFromSlug = (t.category_slug || t.categories?.[0]?.slug || "Akıllı Ürünler")
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const catName = targetCategory.name || targetCategory.title || catNameFromSlug;
      const catSlug = t.category_slug || targetCategory.slug || t.categories?.[0]?.slug || "urunler";

      seen.add(targetId);
      list.push({
        id: targetId,
        name: t.name || "",
        slug: t.slug || "",
        price: t.price ?? 0,
        final_price: t.final_price ?? t.discount_price ?? t.price ?? 0,
        cover_image: t.cover_image,
        categories: t.categories || [],
        category_slug: catSlug,
        category_name: catName,
        item_category: catName,
        stock_quantity: t.stock_quantity,
        unlimited_stock: t.unlimited_stock,
        max_purchase_quantity: t.max_purchase_quantity || t.max_quantity,
        is_pre_order: t.is_pre_order || false,
      });
    });

    return list;
  }, [cross_sale_campaigns, cartProductIds, products]);

  const handleAddToCart = async (target) => {
    if (addingSlug || !target?.slug) return;

    // Bulunan ürünü sepetteki miktarıyla karşılaştır
    const itemInCart = items.find(it => (it.productId || it.product?.id || it.id) === target.id);
    const currentQty = itemInCart?.quantity || 0;

    // Ürün verilerini hazırla
    const product = {
      id: target.id,
      slug: target.slug,
      name: target.name,
      price: target.final_price,
      cover_image: target.cover_image,
      stock_quantity: target.stock_quantity,
      unlimited_stock: target.unlimited_stock,
      max_purchase_quantity: target.max_purchase_quantity || target.max_quantity,
      is_pre_order: target.is_pre_order || false,
      categories: target.categories || [],
      category_slug: target.category_slug,
      category_name: target.category_name,
      item_category: target.item_category
    };

    // Limit kontrolü
    const purchaseLimit = Number(product.max_purchase_quantity) || 0;
    const stockLimit = (!product.unlimited_stock && product.stock_quantity != null) ? Number(product.stock_quantity) : null;

    let effectiveLimit = purchaseLimit === 0 ? null : purchaseLimit;
    if (!product.is_pre_order && stockLimit !== null) {
      if (effectiveLimit === null) effectiveLimit = stockLimit;
      else effectiveLimit = Math.min(effectiveLimit, stockLimit);
    }

    if (effectiveLimit !== null && effectiveLimit > 0 && currentQty >= effectiveLimit) {
      const isStockLimiting = !product.is_pre_order && stockLimit !== null && (purchaseLimit === 0 || stockLimit <= purchaseLimit);
      setMaxQuantityForToast(effectiveLimit);
      setIsStockLimitForToast(isStockLimiting);
      setShowMaxReachedToast(true);
      return;
    }

    setAddingSlug(target.slug);
    try {
      const result = await addItem(product, 1, true);
      if (result && !result.added) {
        if (result.error === 'MAX_QUANTITY_REACHED' || result.message?.includes('stok')) {
          const limit = result.maxQuantity || effectiveLimit;
          setMaxQuantityForToast(limit);
          setIsStockLimitForToast(true); // Genelde sepet üstünde limit hatası stoktandır
          setShowMaxReachedToast(true);
        } else {
          setErrorToastMessage(result.message || t.errorAdd);
          setShowErrorToast(true);
        }
      }
    } catch (e) {
      console.error("Cross-sale sepete ekleme hatası:", e);
      setErrorToastMessage(e.message || t.systemError);
      setShowErrorToast(true);
    } finally {
      setAddingSlug(null);
    }
  };

  if (targetProducts.length === 0) return null;

  return (
    <div className="birlikte-al-sepet" style={{ marginBottom: 4, width: "100%", maxWidth: "100%", minWidth: 0, }}>
      <MaxQuantityToast visible={showMaxReachedToast} onHide={() => setShowMaxReachedToast(false)} maxQuantity={maxQuantityForToast} isStockLimit={isStockLimitForToast} />
      <ErrorToast visible={showErrorToast} onHide={() => setShowErrorToast(false)} message={errorToastMessage} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, minWidth: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayTitle}</span>
        {targetProducts.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <NavDotsPill
              total={targetProducts.length}
              activeIndex={activeIndex}
              onDotClick={(i) => swiperRef.current?.slideTo?.(i)}
              ariaLabel={t.ariaLabel}
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
          {targetProducts.map((item, i) => {
            const cat = item.category_slug || "urunler";
            const slug = item.slug || "";
            const url = `/magaza/${cat}/${slug}`;
            const price = item.price ?? 0;
            const final = item.final_price ?? 0;
            const hasDiscount = final < price && price > 0;
            const img = item.cover_image?.thumbnail_url || item.cover_image?.url || item.image || item.imgSrc || item.product?.cover_image?.thumbnail_url || item.product?.cover_image?.url || null;
            const isAdding = addingSlug === item.slug;

            return (
              <SwiperSlide key={item.id || i} style={{ height: "auto", boxSizing: "border-box", width: "100%", maxWidth: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 12, background: "#fff", overflow: "hidden", minHeight: 100, width: "100%", maxWidth: "100%", boxSizing: "border-box", paddingLeft: 12, paddingRight: 12 }}>
                  {img ? (
                    <div style={{ width: 72, minWidth: 72, height: 72, flexShrink: 0, overflow: "hidden", background: "#f5f5f5" }}>
                      <Image
                        src={img}
                        alt={item.cover_image?.alt_text || item.name || ""}
                        width={80}
                        height={80}
                        unoptimized={String(img).startsWith("http")}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: 72, minWidth: 72, height: 72, flexShrink: 0, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>
                      {t.noImage}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                    <Link
                      href={url}
                      style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, textDecoration: "none" }}
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: hasDiscount ? "#0bc15c" : "#3c81b5" }}>{Number(final).toLocaleString(t.locale)} TL</span>
                      {hasDiscount && <span style={{ fontSize: 13, color: "#999", textDecoration: "line-through" }}>{Number(price).toLocaleString(t.locale)} TL</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddToCart(item)}
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
                    {isAdding ? t.adding : t.addToCart}
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

