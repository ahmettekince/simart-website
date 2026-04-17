
import Hero from "@/components/homes/home-electronic/Hero";
import nextDynamic from "next/dynamic";

// Sayfanın altında kalan bileşenleri dinamik yüklüyoruz.
// Bu işlem ana paketi küçültür ve tarayıcının daha hızlı render yapmasını sağlar.
const Features = nextDynamic(() => import("@/components/homes/home-electronic/Features"), { ssr: true });
const HomeReviews = nextDynamic(() => import("@/components/common/HomeReviews"), { ssr: true });
const Blogs = nextDynamic(() => import("@/components/homes/home-electronic/Blogs"), { ssr: true });
const Categories = nextDynamic(() => import("@/components/homes/home-electronic/Categories"), { ssr: true });
const CollectionBanner = nextDynamic(() => import("@/components/homes/home-electronic/CollectionBanner"), { ssr: true });
const Collections = nextDynamic(() => import("@/components/homes/home-electronic/Collections"), { ssr: true });
const Products = nextDynamic(() => import("@/components/homes/home-electronic/Products"), { ssr: true });

import React from "react";
import { getCategories, getBanners, getCollectionBanner, getCollections, getReviews } from "@/api/home";
import { getMenus } from "@/api/menus";
import { siteConfig } from "@/config/site";
import { organizationSchema } from "@/lib/schema";

const translations = {
  tr: {
    title: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
    description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
    ogImage: "https://simart.me/og.jpg",
    twitterImage: "https://simart.me/og.jpg",
    itempropImage: "https://simart.me/uploads/systems/seo.jpg",
  },
  en: {
    title: "Şımart Technology - Robot Vacuum and Smart Home Systems",
    description: "Şımart Technology is a pioneer in robot vacuums, smart home systems, and IoT solutions. We are at your service with home automation and life-enhancing technologies.",
    ogImage: "https://simart.me/og_en.jpg",
    twitterImage: "https://simart.me/og_en.jpg",
    itempropImage: "https://simart.me/uploads/systems/seo_en.jpg",
  },
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = translations[lang] || translations.tr;
  const baseUrl = siteConfig.site.url;

  return {
    title: t.title,
    description: t.description,
    base: baseUrl,
    openGraph: {
      title: t.title,
      description: t.description,
      images: [{ url: t.ogImage }],
      type: "website",
      locale: lang === "tr" ? "tr_TR" : "en_US",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [t.twitterImage],
      site: "@simartteknoloji",
      creator: "@simartteknoloji",
    },
    other: {
      "itemprop:name": t.title,
      "itemprop:description": t.description,
      "itemprop:image": t.itempropImage,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function Home({ params }) {
  const { lang } = await params;

  const [menuItems, banners, collectionBanner, collections, reviews] = await Promise.all([
    getMenus(lang),
    getBanners(lang),
    getCollectionBanner(lang),
    getCollections(lang),
    getReviews(lang),
  ]);
  const t = translations[lang] || translations.tr;

  const organizationJsonLd = organizationSchema({
    url: siteConfig.site.url,
    description: t.description,
  });

    return (
    <>
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        {lang === "en" ? "Şımart Technology - Smart Home Systems and Robot Vacuums" : "Şımart Teknoloji - Akıllı Ev Sistemleri ve Robot Süpürgeler"}
      </h1>
      <div className="color-primary-15">
        <Hero banners={banners} />
        <Categories lang={lang} />
        <CollectionBanner banner={collectionBanner} lang={lang} />
        <Collections collections={collections} lang={lang} />
        <Products lang={lang} />
        <HomeReviews reviews={reviews} lang={lang} />
        <Blogs lang={lang} />
        <Features lang={lang} />
      </div>
    </>
  );
}
