"use client";

import { useEffect, useRef } from "react";
import apiClient from "@/utils/apiClient";

/**
 * Ürün detay sayfası görüntülendiğinde hit endpoint'ini çağırır.
 * /products/{slug}/hit - kullanıcıların ürün detayına giriş sayısını takip için.
 */
export default function ProductDetailHit({ productSlug }) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!productSlug || typeof productSlug !== "string" || sentRef.current) return;
    const slug = productSlug.trim();
    if (!slug) return;

    sentRef.current = true;
    apiClient
      .post(`/products/${slug}/hit`)
      .catch(() => {
        // Sessizce yoksay; analytics için kritik değil, sayfa çalışmaya devam etsin
      });
  }, [productSlug]);

  return null;
}
