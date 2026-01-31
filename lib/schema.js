import { siteConfig } from "@/config/site";

export function organizationSchema({ url, description } = {}) {
  // Sosyal medya hesaplarını siteConfig'den al ve boş olmayanları filtrele
  // Default değerler
  const defaultUrl = "https://simart.me";
  const defaultDescription = "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Şımart Teknoloji",
    url: url || defaultUrl,
    logo: siteConfig.site.logo,
    description: description || defaultDescription,
    sameAs: [
      "https://www.instagram.com/simartteknoloji/",
      "https://www.facebook.com/simartteknoloji",
      "https://www.youtube.com/c/%C5%9E%C4%B1martTeknoloji",
      "https://x.com/simartteknoloji",
      "https://www.linkedin.com/company/%C5%9F%C4%B1mart-teknoloji/",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+90-552-642-8208",
        contactType: "Müşteri Hizmetleri",
      },
      {
        "@type": "ContactPoint",
        telephone: "+90-850-346-6126",
        contactType: "Müşteri Hizmetleri",
      },
    ],
  };
}

export function webPageSchema({ name, url, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: name,
    url: url,
    description: description,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: siteConfig.site.logo,
    },
    sameAs: [
      "https://www.instagram.com/simartteknoloji/",
      "https://www.facebook.com/simartteknoloji",
      "https://www.youtube.com/c/%C5%9E%C4%B1martTeknoloji",
      "https://x.com/simartteknoloji",
      "https://www.linkedin.com/company/%C5%9F%C4%B1mart-teknoloji/",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+90-552-642-8208",
        contactType: "Müşteri Hizmetleri",
      },
      {
        "@type": "ContactPoint",
        telephone: "+90-850-346-6126",
        contactType: "Müşteri Hizmetleri",
      },
    ],
  };
}

// Ürün detay sayfaları için Product schema
export function productSchema({
  name,
  description,
  images,
  sku,
  price,
  url,
  ratingValue,
  reviewCount,
  gtin,
  reviews = [],
}) {
  // Fiyat geçerlilik tarihi: her zaman bugünden 1 ay sonrası
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const priceValidUntil = oneMonthLater.toISOString().split("T")[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: Array.isArray(images) ? images : images ? [images] : [],
    brand:
    {
      "@type": "Brand",
      "name": "Şımart Teknoloji",
    },
    sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: price,
      availability: "https://schema.org/InStock",
      url,
      ...(gtin && { gtin }),
      priceValidUntil,
      itemCondition: "http://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Şımart Teknoloji",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        url: "https://simart.me/iade-ve-geri-odeme-politikasi",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "TRY",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  if (ratingValue != null && reviewCount) {
    const roundedRating = Number(ratingValue);
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number.isFinite(roundedRating) ? Math.round(roundedRating * 10) / 10 : ratingValue,
      reviewCount: Number(reviewCount) || 0,
      bestRating: 5,
    };
  }

  if (reviews && reviews.length > 0) {
    schema.review = reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.user_name || r.author?.name || "Anonim",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: Math.round(r.rating || 0) || 5,
        bestRating: "5",
      },
      reviewBody: (r.comment || r.reviewBody || "").trim(),
      ...(r.created_at && { datePublished: new Date(r.created_at).toISOString().split("T")[0] }),
    }));
  }

  return schema;
}