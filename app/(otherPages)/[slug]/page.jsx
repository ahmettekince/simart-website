import { getPageBySlug } from "@/api/pages"
import { notFound } from "next/navigation";
import { getQrCard } from "@/api/qr";
import { getMenus, getFooterMenus } from "@/api/menus";
import Header from "@/components/headers/Header";
import { webPageSchema } from "@/lib/schema";
import { siteConfig } from "@/config/site";
import DynamicPageContent from "@/components/common/DynamicPageContent";
import QRContent from "@/components/common/QRContent";

// Engellenen istekler
const blockedSlugs = [
  "meta.json",
  "queue.php",
  "robots.txt"
];

// Dinamik metadata oluşturma
export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Engellenen istekler kontrolü
  const normalizedSlug = slug?.toLowerCase();
  if (blockedSlugs.includes(normalizedSlug)) {
    return {
      title: "Sayfa Bulunamadı",
      robots: "noindex, nofollow",
    };
  }

  // QR sayfa kontrolü 
  if (slug.startsWith("qr-")) {
    const qrData = await getQrCard(slug);
    if (!qrData) {
      return { title: "QR Kart Bulunamadı - Şımart Teknoloji" };
    }
    return {
      title: `${qrData.full_name} - Şımart Teknoloji`,
      description: `${qrData.full_name} QR Tanıtım Sayfası`,
    };
  }

  // Standart sayfa kontrolü
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: "Sayfa Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız sayfa bulunamadı.",
      robots: "noindex, nofollow",
    };
  }

  const title = page.title || siteConfig.site.title;
  const description = page.seo?.description || page.title || siteConfig.site.description;
  const keywords = page.seo?.keywords || siteConfig.site.keywords;
  const pageUrl = `${siteConfig.site.url}/${slug}`;
  const imageUrl = page.image?.url || siteConfig.site.og.image;

  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: siteConfig.site.author }],
    robots: "index, follow",
    alternates: { canonical: pageUrl },
    openGraph: {
      title: title,
      description: description,
      url: pageUrl,
      siteName: siteConfig.site.name,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: "tr_TR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
      site: siteConfig.site.twitter.site,
      creator: siteConfig.site.twitter.creator,
    },
    other: {
      "itemprop:name": title,
      "itemprop:description": description,
      "itemprop:image": page.image?.url || siteConfig.site.itemprop.image,
    },
  };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;

  // Engellenen istekler kontrolü
  const normalizedSlug = slug?.toLowerCase();
  if (blockedSlugs.includes(normalizedSlug)) {
    return notFound();
  }

  // QR Sayfa Kontrolü
  if (slug.startsWith("qr-")) {
    const [qrData, menuItems] = await Promise.all([
      getQrCard(slug),
      getMenus(),
    ]);

    if (qrData) {
      return <QRContent qrData={qrData} menuItems={menuItems} />;
    }
  }

  // Standart Sayfa/Blog Kontrolü
  const page = await getPageBySlug(slug);

  if (!page) {
    return notFound();
  }

  // WebPage JSON-LD oluştur
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

      {/* Sayfa Başlığı */}
      {!page.image?.url && page.title && (
        <div className="tf-page-title">
          <div className="container-full">
            <div className="heading text-center">{page.title}</div>
          </div>
        </div>
      )}

      {/* İçerik */}
      <DynamicPageContent
        htmlContent={page.content}
        title={page.title}
        image={page.image}
      />
    </>
  );
}
