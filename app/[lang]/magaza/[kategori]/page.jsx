
import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getCategoryWithProducts } from "@/api/products";
import { getCategories } from "@/api/home";
import { notFound } from "next/navigation";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { kategori, lang } = await params;
  const { products, category } = await getCategoryWithProducts(kategori, lang);

  if (!category) {
    return {
      title: "Sayfa Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız kategori bulunamadı.",
    };
  }

  const categoryName = category.name;
  const productCount = category.product_count ?? products.length;

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
            {productCount > 0 ? `${productCount} ürün bulundu` : "Bu kategoride henüz ürün bulunmamaktadır"}
          </p>
        </div>
      </div>

      {/* Ürün Listesi (Client Component) */}
      <MagazaDisplay products={products} categories={categories} />
    </main>
  );
}
