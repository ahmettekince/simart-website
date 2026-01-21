import Header from "@/components/headers/Header";
import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getProductsByCategory } from "@/api/products";
import { getCategories } from "@/api/home";
import { notFound } from "next/navigation";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { kategori } = await params;
  const products = await getProductsByCategory(kategori);
  const categoryName =
    products.length > 0 && products[0].categories?.[0]?.name ? products[0].categories[0].name : kategori;

  return {
    title: `${categoryName} - Şımart Teknoloji`,
    description: `${categoryName} kategorisindeki ürünlerimizi keşfedin. ${products.length} ürün bulundu.`,
  };
}

/**
 * KategoriPage - Server Component
 *
 * Belirli bir kategoriye ait ürünleri gösterir.
 * URL: /magaza/[kategori]
 */
export default async function KategoriPage({ params }) {
  const { kategori } = await params;

  if (!kategori) {
    notFound();
  }

  // Kategoriye ait ürünleri ve tüm kategorileri çek
  const [products, categories] = await Promise.all([getProductsByCategory(kategori), getCategories()]);

  // Kategori adını bul (ilk ürünün kategorisinden)
  const categoryName =
    products.length > 0 && products[0].categories?.[0]?.name ? products[0].categories[0].name : kategori;

  return (
    <main className="magaza-page">
      <Header />

      {/* Sayfa Başlığı */}
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{categoryName}</div>
          <p className="text-center text-2 text_black-2 mt_5">
            {products.length > 0 ? `${products.length} ürün bulundu` : "Bu kategoride ürün bulunamadı"}
          </p>
        </div>
      </div>

      {/* Ürün Listesi (Client Component) */}
      <MagazaDisplay products={products} categories={categories} />
    </main>
  );
}
