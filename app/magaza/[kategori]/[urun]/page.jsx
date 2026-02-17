import Header from "@/components/headers/Header";
import Detail from "@/components/shopDetails/Detail";
import Products from "@/components/shopDetails/Products";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import ProductDetailHit from "@/components/shopDetails/ProductDetailHit";
import React from "react";
import { getProductBySlug, getProductsByCategory } from "@/api/products";
import { notFound } from "next/navigation";
import { productSchema } from "@/lib/schema";

/**
 * Dinamik metadata oluşturma
 */
export async function generateMetadata({ params }) {
  const { kategori, urun } = await params;

  if (!urun) {
    return {
      title: "Ürün Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const product = await getProductBySlug(urun);
  if (!product) {
    return {
      title: "Ürün Bulunamadı - Şımart Teknoloji",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const productName = product.name || product.title || "Ürün";
  const metaDescription = `${productName} ile evinizi akıllı hale getirin! Hemen ${productName} ürününe sahip olun, evinizi geleceğin teknolojisiyle buluşturun!`;
  const metaKeywords = `${productName}, Akıllı ev cihazı, IoT teknolojisi, Akıllı telefon kontrolü, Enerji tasarrufu IoT, Güvenlik IoT ürünü, Akıllı yaşam teknolojisi, Evinizi akıllandırın, IoT ile akıllı ev, Akıllı ev otomasyonu`;

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

  const productUrl = `https://simart.me/magaza/${kategori}/${urun}`;

  return {
    title: `${productName} - Şımart Teknoloji`,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: `${productName} - Şımart Teknoloji`,
      description: metaDescription,
      images: "https://simart.me/uploads/systems/og.jpg",
      url: productUrl,
      locale: "tr_TR",
    },
    other: {
      "og:type": "product",
      "itemprop:name": `${productName} - Şımart Teknoloji`,
      "itemprop:description": metaDescription,
      "itemprop:image": "https://simart.me/uploads/systems/og.jpg",
    },
  };
}

export default async function page({ params }) {
  const { kategori, urun } = await params;

  if (!urun) {
    notFound();
  }

  // API'den ürünü çek
  const product = await getProductBySlug(urun);

  if (!product) {
    notFound();
  }

  // Kategoriye ait ürünleri çek (açık olan ürünü filtrelemek için)
  const categorySlug = product.primary_category?.slug || product.categories?.[0]?.slug;
  let categoryProducts = [];
  if (categorySlug) {
    const allCategoryProducts = await getProductsByCategory(categorySlug);
    // Açık olan ürünü listeden çıkar
    categoryProducts = allCategoryProducts
      .filter((p) => p.id !== product.id && p.slug !== product.slug)
      .slice(0, 8); // Maksimum 8 ürün
  }

  const productName = product.name || product.title || "Ürün";
  const productDescription = `${productName} ile evinizi akıllı hale getirin! Hemen ${productName} ürününe sahip olun, evinizi geleceğin teknolojisiyle buluşturun!`;

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

  const url = `https://simart.me/magaza/${kategori}/${urun}`;

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
    ratingValue: ratingValueFromApi ?? 5,
    reviewCount: reviewCountFromApi ?? 18,
    reviews: product.reviews?.items || [],
  });

  return (
    <>
      {/* Product JSON-LD (ürün sayfası) */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailHit productSlug={urun} />
      <Header />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              {/* <Link href={`/`} className="text">
                Mağaza
              </Link>

              <i className="icon icon-arrow-right" />
              <Link href={`/magaza/${kategori}`} className="text">
                {categoryName}
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">{productName}</span> */}
            </div>
          </div>
        </div>
      </div>
      <Detail product={product} />
      <ShopDetailsTab product={product} />
      {categoryProducts.length > 0 && <Products products={categoryProducts} />}
    </>
  );
}
