import { notFound } from "next/navigation";
import { getPageBySlug } from "@/api/pages";
import Header from "@/components/headers/Header";
import { webPageSchema } from "@/lib/schema";
import { siteConfig } from "@/config/site";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: "Sayfa Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız sayfa bulunamadı.",
      robots: "noindex, nofollow",
    };
  }

  const title = page.title || "Şımart Teknoloji Sayfa İçeriği";
  const description = page.seo?.description || "Şımart Teknoloji sayfa içeriği";
  const keywords = page.seo?.keywords || siteConfig.site.keywords;

  return {
    title: `${title}`,
    description: description,
    keywords: keywords,
  };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;

  // Tüm sayfalar (bloglar dahil) /pages?slug=xx API'sinden çekiliyor
  const page = await getPageBySlug(slug);

  if (!page) {
    return notFound();
  }

  // WebPage schema oluştur
  const pageUrl = `${siteConfig.site.url}/${slug}`;
  const pageJsonLd = webPageSchema({
    name: page.title || "Şımart Teknoloji Sayfa İçeriği",
    url: pageUrl,
    description: page.seo?.description || page.title || "Şımart Teknoloji sayfa içeriği",
  });

  return (
    <>
      {/* WebPage JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <Header />
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            {page.title && <h1 className="mb-4">{page.title}</h1>}
            {page.content && <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }} />}
          </div>
        </div>
      </div>
    </>
  );
}
