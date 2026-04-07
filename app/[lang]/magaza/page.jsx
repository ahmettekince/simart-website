
import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/home";

export const dynamic = "force-dynamic";

const translations = {
  tr: {
    title: "Mağaza - Şımart Teknoloji",
    description: "Şımart Teknoloji mağaza sayfası, tüm ürünlerimizi keşfedin.",
    heading: "Mağaza",
    subheading: "Tüm ürünlerimizi keşfedin"
  },
  en: {
    title: "Shop - Şımart Technology",
    description: "Şımart Technology shop page, explore all our products.",
    heading: "Shop",
    subheading: "Explore all our products"
  }
};

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { lang = "tr" } = await params;
  const t = translations[lang] || translations.tr;

  return {
    title: t.title,
    description: t.description,
  };
}

/**
 * MagazaPage - Server Component
 *
 * Veriyi sunucu tarafında çeker (SEO dostu) ve
 * görselleştirme için MagazaDisplay (Client Component) bileşenine iletir.
 */
export default async function MagazaPage({ params }) {
  const { lang = "tr" } = await params;
  const t = translations[lang] || translations.tr;

  // Ürünleri ve kategorileri sunucu tarafında çek
  const [products, categories] = await Promise.all([
    getProducts({}, lang),
    getCategories(lang)
  ]);

  return (
    <main className="magaza-page">
      {/* Sayfa Başlığı */}
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{t.heading}</div>
          <p className="text-center text-2 text_black-2 mt_5">{t.subheading}</p>
        </div>
      </div>

      {/* Ürün Listesi (Client Component) */}
      <MagazaDisplay products={products} categories={categories} />
    </main>
  );
}
