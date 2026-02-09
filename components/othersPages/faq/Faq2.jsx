"use client";

import Accordion from "@/components/common/Accordion";
import ProductMediaSection from "./ProductMediaSection";
import DefaultFaqSection from "./DefaultFaqSection";
import { faqs1 } from "@/data/faqs";
import React from "react";

export default function Faq2({ faqs, loading = false, selectedProduct, selectedCategory }) {
  const isSssMode = selectedProduct !== undefined || selectedCategory !== undefined;
  const productName = selectedProduct?.name ?? selectedProduct?.title ?? selectedProduct?.slug ?? "";
  const categoryName = selectedCategory?.name ?? selectedCategory?.title ?? selectedCategory?.slug ?? "";
  const title = productName || categoryName;

  if (isSssMode && !selectedProduct && !selectedCategory) {
    return <DefaultFaqSection />;
  }

  if (isSssMode && loading) {
    return (
      <>
        <h5 className="mb_24" id="faq-content">
          {title}
        </h5>
        <p className="text-muted mb_60">Yükleniyor...</p>
      </>
    );
  }

  if (isSssMode && selectedProduct) {
    return (
      <div className="sss-product-detail">
        <h5 className="mb_24" id="faq-content">
          {title}
        </h5>

        {/* YouTube + Kullanım kılavuzu */}
        <ProductMediaSection product={selectedProduct} />

        {/* Ürüne ait sıkça sorulan sorular */}
        <h6 className="sss-faq-title mb_20 fw-6">Sıkça Sorulan Sorular</h6>
        {!faqs || faqs.length === 0 ? (
          <p className="text-muted mb_60">Bu üründe henüz soru bulunmuyor.</p>
        ) : (
          <div className="flat-accordion style-default has-btns-arrow mb_60">
            <Accordion faqs={faqs} initialIndex={-1} />
          </div>
        )}
      </div>
    );
  }

  if (isSssMode && selectedCategory) {
    return (
      <>
        <h5 className="mb_24" id="faq-content">
          {title}
        </h5>
        <div className="flat-accordion style-default has-btns-arrow mb_60">
          <Accordion faqs={faqs} initialIndex={-1} />
        </div>
      </>
    );
  }

  // Özgün kullanım (faq-2 vb.): props yokken varsayılan Accordion
  return (
    <>
      <h5 className="mb_24" id="payment-information">
        Payment Information
      </h5>
      <div className="flat-accordion style-default has-btns-arrow mb_60">
        <Accordion faqs={faqs1} />
      </div>
    </>
  );
}
