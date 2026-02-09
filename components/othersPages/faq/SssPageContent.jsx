"use client";

import { useState, useMemo } from "react";
import SssSidebar from "./SssSidebar";
import Faq2 from "./Faq2";

/** Ürün faq_data'sını Accordion formatına çevirir: { title, content } */
function faqDataToFaqs(faqData) {
  if (!Array.isArray(faqData)) return [];
  return faqData
    .map((item) => {
      const title = item.title || item.question || "";
      const content = item.content || item.answer || "";
      return title ? { title, content } : null;
    })
    .filter(Boolean);
}

export default function SssPageContent({ categories = [], productsByCategory = {} }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const faqs = useMemo(
    () => faqDataToFaqs(selectedProduct?.faq_data || []),
    [selectedProduct]
  );

  return (
    <div className="tf-accordion-wrap d-flex justify-content-between">
      <div className="box">
        <SssSidebar
          categories={categories}
          productsByCategory={productsByCategory}
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
        />
      </div>
      <div className="content">
        <Faq2 faqs={faqs} loading={false} selectedProduct={selectedProduct} />
      </div>
    </div>
  );
}
