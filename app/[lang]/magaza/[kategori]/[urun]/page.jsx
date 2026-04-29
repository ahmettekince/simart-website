
import Detail from "@/components/shopDetails/Detail";
import Products from "@/components/shopDetails/Products";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import ProductDetailHit from "@/components/shopDetails/ProductDetailHit";
import ProductDescription from "@/components/shopDetails/ProductDescription";
import BirlikteAlNew from "@/components/shopDetails/BirlikteAlNew";
import React from "react";
import { getProductBySlug, getProductsByCategory } from "@/api/products";
import { notFound } from "next/navigation";
import { productSchema } from "@/lib/schema";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { kategori, urun, lang } = await params;

  if (!urun) {
    return {
      title: "Ürün Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const product = await getProductBySlug(urun, lang);
  if (!product) {
    return {
      title: "Ürün Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const productName = product.name || product.title || "Ürün";
  const titleSuffix = lang === "en" ? "Şımart Technology" : "Şımart Teknoloji";

  const seoTitle = product.seo?.title || `${productName} - ${titleSuffix}`;
  const metaDescription = product.seo?.description || `${productName} ile evinizi akıllı hale getirin! Hemen ${productName} ürününe sahip olun, evinizi geleceğin teknolojisiyle buluşturun!`;
  const metaKeywords = product.seo?.keywords || `${productName}, Akıllı ev cihazı, IoT teknolojisi, Akıllı telefon kontrolü, Enerji tasarrufu IoT, Güvenlik IoT ürünü, Akıllı yaşam teknolojisi, Evinizi akıllandırın, IoT ile akıllı ev, Akıllı ev otomasyonu`;

  // Robots ayarları (index/noindex, follow/nofollow)
  const robots = `${product.seo?.no_index ? "noindex" : "index"}, ${product.seo?.no_follow ? "nofollow" : "follow"}`;

  // gallery_images içindeki objelerden url çıkar
  const normalizeImages = (images) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object") return img.url || img.src || img;
      return img;
    });
  };

  const productImages = normalizeImages(
    product.images || product.gallery_images || (product.image ? [product.image] : [])
  );

  const urlPrefix = lang === "en" ? "/en/shop" : "/magaza";
  const productUrl = `https://simart.me${urlPrefix}/${product.primary_category?.slug || kategori}/${product.slug || urun}`;

  return {
    title: seoTitle,
    description: metaDescription,
    keywords: metaKeywords,
    robots: robots,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: seoTitle,
      description: metaDescription,
      images: "https://simart.me/uploads/systems/og.jpg",
      url: productUrl,
      locale: lang === "en" ? "en_US" : "tr_TR",
    },
    other: {
      "og:type": "product",
      "itemprop:name": seoTitle,
      "itemprop:description": metaDescription,
      "itemprop:image": "https://simart.me/uploads/systems/og.jpg",
    },
  };
}

export default async function page({ params }) {
  const { kategori, urun, lang } = await params;

  if (!urun) {
    notFound();
  }

  // API'den ürünü çek
  const product = await getProductBySlug(urun, lang);

  if (!product) {
    notFound();
  }

  // Kategoriye ait ürünleri çek (açık olan ürünü filtrelemek için)
  const categorySlug = product.primary_category?.slug || product.categories?.[0]?.slug;
  let categoryProducts = [];
  if (categorySlug) {
    const allCategoryProducts = await getProductsByCategory(categorySlug, lang);
    // Açık olan ürünü listeden çıkar
    categoryProducts = allCategoryProducts
      .filter((p) => p.id !== product.id && p.slug !== product.slug)
      .slice(0, 8); // Maksimum 8 ürün
  }

  const productName = product.name || product.title || "Ürün";
  // const productDescription = `${productName} ile evinizi akıllı hale getirin! Hemen ${productName} ürününe sahip olun, evinizi geleceğin teknolojisiyle buluşturun!`;
  const productDescription = product.seo?.description || `${productName} ile evinizi akıllı hale getirin! Hemen ${productName} ürününe sahip olun, evinizi geleceğin teknolojisiyle buluşturun!`;

  // Kategori adını bul (primary_category veya categories[0] veya slug'dan)
  const categoryName =
    product.primary_category?.name ||
    product.categories?.[0]?.name ||
    kategori;

  // gallery_images içindeki objelerden url çıkar
  const normalizeImages = (images) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object") return img.url || img.src || img;
      return img;
    });
  };

  const productImages = normalizeImages(
    product.images || product.gallery_images || (product.image ? [product.image] : [])
  );

  const urlPrefix = lang === "en" ? "/en/shop" : "/magaza";
  const url = `https://simart.me${urlPrefix}/${product.primary_category?.slug || kategori}/${product.slug || urun}`;

  const ratingValueFromApi =
    product.reviews?.average_rating || product.rating_value;
  const reviewCountFromApi =
    product.reviews?.count || product.review_count;

  const jsonLd = productSchema({
    name: productName,
    description: productDescription,
    images: productImages,
    sku: product.sku,
    gtin: product.sku,
    price: product.discount_price || product.price,
    url,
    ratingValue: ratingValueFromApi ?? 0,
    reviewCount: reviewCountFromApi ?? 0,
    reviews: product.reviews?.items || [],
  });

  // Varyasyonları hesapla (mobilde gösterilecek BirlikteAlNew için)
  const hasVariations = product && Array.isArray(product.variations) && product.variations.length > 0;
  let allVariations = [];
  if (hasVariations) {
    const baseVariation = {
      name: product.name || product.title || "",
      slug: product.slug || "",
      category_slug: categorySlug || "urunler",
      is_in_stock: product.is_in_stock,
      is_pre_order: product.is_pre_order,
      price: product.price,
      discount_price: product.discount_price,
      cover_image: product.images?.[0] || product.gallery_images?.[0] || null,
    };
    allVariations.push(baseVariation);
    product.variations.forEach((v) => {
      if (!v) return;
      if (v.slug === baseVariation.slug) return;
      allVariations.push({
        ...v,
        slug: v.slug || "",
        category_slug: v.category_slug || baseVariation.category_slug
      });
    });
  }

  return (
    <>
      {/* Product JSON-LD (ürün sayfası) */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailHit productSlug={urun} />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
            </div>
          </div>
        </div>
      </div>
      
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        {lang === "tr" 
          ? `${productName} - Şımart Teknoloji Akıllı Ev Sistemleri` 
          : `${productName} - Şımart Technology Smart Home Systems`}
      </h1>
      <Detail product={product} />

      {/* Detaylı Açıklama Alanı */}
      <ProductDescription product={product} />

      {/* Birlikte Al - Mobilde Açıklama ve Sekmeler arasında */}
      {allVariations.length > 0 && (
        <div className="container d-md-none" style={{ marginTop: 0, marginBottom: 24 }}>
          <BirlikteAlNew
            variations={allVariations}
            currentSlug={product.slug}
            currentCategorySlug={categorySlug || "urunler"}
          />
        </div>
      )}

      <ShopDetailsTab product={product} />
      {categoryProducts.length > 0 && <Products products={categoryProducts} />}
    </>
  );
}
