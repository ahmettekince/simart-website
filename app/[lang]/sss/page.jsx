
import SssPageContent from "@/components/othersPages/faq/SssPageContent";
import { getCategories } from "@/api/home";
import { getCategoryWithProducts } from "@/api/products";

export const metadata = {
  title: "Sıkça Sorulan Sorular - Şımart Teknoloji",
  description: "Sıkça sorulan sorular ve yanıtları.",
};

export default async function SssPage() {
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
      <section className="flat-spacing-11">
        <div className="container">
          <SssPageContent
            categories={filtered}
            productsByCategory={productsByCategory}
          />
        </div>
      </section>
    </>
  );
}
