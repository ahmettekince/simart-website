import MagazaDisplay from "@/components/shop/MagazaDisplay";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/home";

export const dynamic = "force-dynamic";

const SR_ONLY_H1_STYLE = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  border: "0",
};

const translations = {
  tr: {
    title: "Mağaza - Şımart Teknoloji",
    description: "Şımart Teknoloji mağaza sayfası, tüm ürünlerimizi keşfedin.",
    heading: "Mağaza",
    subheading: "Tüm ürünlerimizi keşfedin",
    seoH1: "Robot Süpürge ve Akıllı Ev Sistemleri",
  },
  en: {
    title: "Shop - Şımart Technology",
    description: "Şımart Technology shop page, explore all our products.",
    heading: "Shop",
    subheading: "Explore all our products",
    seoH1: "Robot Vacuum and Smart Home Systems",
  },
};

function getPageCopy(lang) {
  return translations[lang] || translations.tr;
}

export async function generateMetadata({ params }) {
  const { lang = "tr" } = await params;
  const { title, description } = getPageCopy(lang);

  return { title, description };
}

export default async function MagazaPage({ params }) {
  const { lang = "tr" } = await params;
  const t = getPageCopy(lang);

  const [products, categories] = await Promise.all([
    getProducts("", lang),
    getCategories(lang),
  ]);

  return (
    <main className="magaza-page">
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{t.heading}</div>
          <p className="text-center text-2 text_black-2 mt_5">{t.subheading}</p>
        </div>
      </div>

      <h1 style={SR_ONLY_H1_STYLE}>{t.seoH1}</h1>

      <MagazaDisplay products={products} categories={categories} />
    </main>
  );
}
