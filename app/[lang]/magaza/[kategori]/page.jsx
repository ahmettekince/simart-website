
import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getCategoryWithProducts } from "@/api/products";
import { getCategories } from "@/api/home";
import { notFound } from "next/navigation";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { kategori, lang } = await params;
  const { category } = await getCategoryWithProducts(kategori, lang);

  if (!category) {
    return {
      title: "Sayfa Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız kategori bulunamadı.",
    };
  }

  const categoryName = category.name;
  const seoDescription =
    category.seo_description ??
    `${categoryName} kategorisindeki ürünlerimizi keşfedin.`;
  const seoKeywords = category.seo_keywords ?? undefined;

  const titleSuffix = lang === "en" ? "Şımart Technology" : "Şımart Teknoloji";
  
  return {
    title: `${categoryName} - ${titleSuffix}`,
    description: seoDescription,
    ...(seoKeywords && { keywords: seoKeywords }),
  };
}

/**
 * KategoriPage - Server Component
 *
 * Belirli bir kategoriye ait ürünleri gösterir.
 * URL: /magaza/[kategori]
 */
export default async function KategoriPage({ params }) {
  const { kategori, lang } = await params;

  if (!kategori) {
    notFound();
  }

  // Kategori bilgisi ve ürünleri (API'den category objesi gelir)
  const [{ products, category }, categories] = await Promise.all([
    getCategoryWithProducts(kategori, lang),
    getCategories(lang),
  ]);

  // Eğer kategori objesi gelmediyse (API'de öyle bir kategori yoksa) 404 fırlat
  if (!category) {
    notFound();
  }

  const categoryName = category.name;
  const productCount = category.product_count ?? products.length;

  return (
    <main className="magaza-page">
      {/* Sayfa Başlığı */}
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{categoryName}</div>
          <p className="text-center text-2 text_black-2 mt_5">
            {productCount > 0
              ? (lang === "tr" ? `${productCount} ürün bulundu` : `${productCount} products found`)
              : (lang === "tr" ? "Bu kategoride henüz ürün bulunmamaktadır" : "There are no products in this category yet")
            }
          </p>
        </div>
      </div>

      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        {lang === "tr" 
          ? `${categoryName} - Şımart Teknoloji Akıllı Ev Sistemleri` 
          : `${categoryName} - Şımart Technology Smart Home Systems`}
      </h1>

      {/* Ürün Listesi (Client Component) */}
      <MagazaDisplay products={products} categories={categories} initialCategory={category} />
    </main>
  );
}
