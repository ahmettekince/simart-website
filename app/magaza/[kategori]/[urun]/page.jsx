import Footer from "@/components/footers/Footer";
import Header from "@/components/headers/Header";
import Details9 from "@/components/shopDetails/Details9";
import Products from "@/components/shopDetails/Products";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
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
  const productDescription =
    product.description || `${productName} ürün detayları, özellikleri ve kullanıcı yorumları.`;

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

  return {
    title: `${productName} - Şımart Teknoloji`,
    description: productDescription,
    openGraph: {
      title: productName,
      description: productDescription,
      images: productImages.length > 0 ? productImages : [],
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
  const productDescription =
    product.description || `${productName} ürün detayları, özellikleri ve kullanıcı yorumları.`;

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
    ratingValue: ratingValueFromApi ? ratingValueFromApi : 5,
    reviewCount: reviewCountFromApi ? reviewCountFromApi : 18,
  });

  return (
    <>
      {/* Product JSON-LD (ürün sayfası) */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text">
                Mağaza
              </Link>

              <i className="icon icon-arrow-right" />
              <Link href={`/magaza/${kategori}`} className="text">
                {categoryName}
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">{productName}</span>
            </div>
          </div>
        </div>
      </div>
      <Details9 product={product} />
      <ShopDetailsTab product={product} />
      {categoryProducts.length > 0 && <Products products={categoryProducts} />}
    </>
  );
}
