import Detail from "@/components/shopDetails/Detail";
import Products from "@/components/shopDetails/Products";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import ProductDetailHit from "@/components/shopDetails/ProductDetailHit";
import ProductDescription from "@/components/shopDetails/ProductDescription";
import BirlikteAlNew from "@/components/shopDetails/BirlikteAlNew";
import { getProductBySlug, getProductsByCategory } from "@/api/products";
import { notFound } from "next/navigation";
import { productSchema } from "@/lib/schema";

const NOT_FOUND_METADATA = {
  title: "Ürün Bulunamadı - Şımart Teknoloji",
  description: "Aradığınız ürün bulunamadı.",
};

const DEFAULT_KEYWORDS_SUFFIX =
  "Akıllı ev cihazı, IoT teknolojisi, Akıllı telefon kontrolü, Enerji tasarrufu IoT, Güvenlik IoT ürünü, Akıllı yaşam teknolojisi, Evinizi akıllandırın, IoT ile akıllı ev, Akıllı ev otomasyonu";

function getProductName(product) {
  return product.name || product.title || "Ürün";
}

function getProductDescription(product, productName) {
  return (
    product.seo?.description ||
    `${productName} ile evinizi akıllı hale getirin! Hemen ${productName} ürününe sahip olun, evinizi geleceğin teknolojisiyle buluşturun!`
  );
}

function getProductMetaKeywords(product, productName) {
  return product.seo?.keywords || `${productName}, ${DEFAULT_KEYWORDS_SUFFIX}`;
}

function getProductUrl({ lang, kategori, urun, product }) {
  const urlPrefix = lang === "en" ? "/en/shop" : "/magaza";
  return `https://simart.me${urlPrefix}/${product.primary_category?.slug || kategori}/${product.slug || urun}`;
}

function normalizeProductImages(product) {
  const images = product.images || product.gallery_images || (product.image ? [product.image] : []);
  if (!Array.isArray(images)) return [];

  return images.map((img) => {
    if (typeof img === "string") return img;
    if (img && typeof img === "object") return img.url || img.src || img;
    return img;
  });
}

function buildProductVariations(product, categorySlug) {
  if (!Array.isArray(product.variations) || product.variations.length === 0) {
    return [];
  }

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

  const variations = [baseVariation];

  product.variations.forEach((variation) => {
    if (!variation || variation.slug === baseVariation.slug) return;

    variations.push({
      ...variation,
      slug: variation.slug || "",
      category_slug: variation.category_slug || baseVariation.category_slug,
    });
  });

  return variations;
}

export async function generateMetadata({ params }) {
  const { kategori, urun, lang } = await params;

  if (!urun) {
    return NOT_FOUND_METADATA;
  }

  const product = await getProductBySlug(urun, lang);
  if (!product) {
    return NOT_FOUND_METADATA;
  }

  const productName = getProductName(product);
  const titleSuffix = lang === "en" ? "Şımart Technology" : "Şımart Teknoloji";
  const seoTitle = product.seo?.title || `${productName} - ${titleSuffix}`;
  const metaDescription = getProductDescription(product, productName);
  const metaKeywords = getProductMetaKeywords(product, productName);
  const robots = `${product.seo?.no_index ? "noindex" : "index"}, ${product.seo?.no_follow ? "nofollow" : "follow"}`;
  const productUrl = getProductUrl({ lang, kategori, urun, product });

  return {
    title: seoTitle,
    description: metaDescription,
    keywords: metaKeywords,
    robots,
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

  const product = await getProductBySlug(urun, lang);

  if (!product) {
    notFound();
  }

  const categorySlug = product.primary_category?.slug || product.categories?.[0]?.slug;
  let categoryProducts = [];

  if (categorySlug) {
    const allCategoryProducts = await getProductsByCategory(categorySlug, lang);
    categoryProducts = allCategoryProducts
      .filter((p) => p.id !== product.id && p.slug !== product.slug)
      .slice(0, 8);
  }

  const productName = getProductName(product);
  const productDescription = getProductDescription(product, productName);
  const metaKeywords = getProductMetaKeywords(product, productName);
  const productImages = normalizeProductImages(product);
  const url = getProductUrl({ lang, kategori, urun, product });

  const ratingValueFromApi =
    product.reviews?.average_rating || product.rating_value;
  const reviewCountFromApi =
    product.reviews?.count || product.review_count;

  const inStock =
    product.unlimited_stock === true ||
    (product.stock_quantity !== undefined && Number(product.stock_quantity) > 0);

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
    inStock,
  });

  const allVariations = buildProductVariations(product, categorySlug);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailHit productSlug={urun} />

      {/* Breadcrumb kesinlikle burada olacak silinemez*/}
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">

            </div>
          </div>
        </div>
      </div>

      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          border: "0",
        }}
      >
        {lang === "tr"
          ? `${productName} - Şımart Teknoloji Akıllı Ev Sistemleri`
          : `${productName} - Şımart Technology Smart Home Systems`}
      </h1>

      <Detail product={product} pageKeywords={metaKeywords} />
      <ProductDescription product={product} pageKeywords={metaKeywords} />

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
