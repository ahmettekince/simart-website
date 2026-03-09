import Header from "@/components/headers/Header";
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

export const metadata = {
  title: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
  description:
    "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
  base: siteConfig.site.url,
  og: {
    title: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
    description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
    image: "https://simart.me/og.jpg",
    type: "website",
    locale: "tr_TR",
    url: "https://simart.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
    description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
    image: "https://simart.me/og.jpg",
    site: "@simartteknoloji",
    creator: "@simartteknoloji",
  },
  other: {
    "itemprop:name": "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
    "itemprop:description": "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
    "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
  },
};

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

  const organizationJsonLd = organizationSchema({
    url: siteConfig.site.url,
    description: metadata.description,
  });

  return (
    <>
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="color-primary-15">
        <Header textClass={"text-black"} menuItems={menuItems} lang={lang} />
        <Hero banners={banners} />
        <Categories />
        <CollectionBanner banner={collectionBanner} />
        <Collections collections={collections} />
        <Products />
        <HomeReviews reviews={reviews} />
        <Blogs />
        <Features />
      </div>
    </>
  );
}
