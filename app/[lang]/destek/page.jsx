import React from "react";
import SupportForm from "@/components/support/SupportForm";

import SssPageContent from "@/components/othersPages/faq/SssPageContent";
import { getCategories } from "@/api/home";
import { getCategoryWithProducts } from "@/api/products";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Destek - Şımart Teknoloji",
  description: "Şımart Teknoloji destek sayfası. Sorularınız için bizimle iletişime geçin.",
};

export default async function SupportPage() {
  const supportJsonLd = webPageSchema({
    name: "Destek - Şımart Teknoloji",
    url: "https://simart.me/destek",
    description:
      "Şımart Teknoloji Destek sayfasında akıllı ev sistemleri ürün açıklamaları, kullanım videoları ve teknik destek bilgilerine ulaşın. Şımart Teknoloji ile hayatınızı kolaylaştırın",
  });

  const categories = await getCategories();
  const filtered = (categories || []).filter(
    (c) => c && c.slug && c.name && c.is_active !== false
  );

  const productsByCategory = {};
  await Promise.all(
    filtered.map(async (cat) => {
      const { products } = await getCategoryWithProducts(cat.slug);
      productsByCategory[cat.slug] = products || [];
    })
  );

  return (
    <>
      {/* WebPage JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supportJsonLd) }}
      />
      <main className="support-page-main">
        {/* Mobilde form üstte, desktopta altta */}
        <section className="support-page-layout flat-spacing-11">
          <div className="container">
            <div className="support-page-grid">
              <div className="support-faq-wrapper">
                <SssPageContent
                  categories={filtered}
                  productsByCategory={productsByCategory}
                />
              </div>
              <div className="support-form-wrapper">
                <SupportForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
