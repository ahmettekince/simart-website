import Header from "@/components/headers/Header";
import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getCategoryWithProducts } from "@/api/products";
import { getCategories } from "@/api/home";
import { notFound } from "next/navigation";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { kategori } = await params;
  const { products, category } = await getCategoryWithProducts(kategori);
  const categoryName = category?.name || kategori;
  const productCount = category?.product_count ?? products.length;

  return {
    title: `${categoryName} - Şımart Teknoloji`,
    description: `${categoryName} kategorisindeki ürünlerimizi keşfedin. ${productCount} ürün bulundu.`,
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

  // Kategori bilgisi ve ürünleri (API'den category objesi gelir)
  const [{ products, category }, categories] = await Promise.all([
    getCategoryWithProducts(kategori),
    getCategories(),
  ]);

  const categoryName = category?.name || kategori;
  const productCount = category?.product_count ?? products.length;

  return (
    <main className="magaza-page">
      <Header />

      {/* Sayfa Başlığı */}
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{categoryName}</div>
          <p className="text-center text-2 text_black-2 mt_5">
            {productCount > 0 ? `${productCount} ürün bulundu` : "Bu kategoride ürün bulunamadı"}
          </p>
        </div>
      </div>

      {/* Ürün Listesi (Client Component) */}
      <MagazaDisplay products={products} categories={categories} />
    </main>
  );
}
