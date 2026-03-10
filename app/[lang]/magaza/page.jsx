
import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/home";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mağaza - Şımart Teknoloji",
  description: "Şımart Teknoloji mağaza sayfası, tüm ürünlerimizi keşfedin.",
};

/**
 * MagazaPage - Server Component
 *
 * Veriyi sunucu tarafında çeker (SEO dostu) ve
 * görselleştirme için MagazaDisplay (Client Component) bileşenine iletir.
 */
export default async function MagazaPage() {
  // Ürünleri ve kategorileri sunucu tarafında çek
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <main className="magaza-page">
      {/* Sayfa Başlığı */}
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Mağaza</div>
          <p className="text-center text-2 text_black-2 mt_5">Tüm ürünlerimizi keşfedin</p>
        </div>
      </div>

      {/* Ürün Listesi (Client Component) */}
      <MagazaDisplay products={products} categories={categories} />
    </main>
  );
}
