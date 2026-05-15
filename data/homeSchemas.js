export const homeSchemas = (t) => {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://simart.me/#organization",
    "name": "Şımart Teknoloji",
    "legalName": "Şımart Teknoloji Anonim Şirketi",
    "url": "https://simart.me/",
    "logo": {
      "@type": "ImageObject",
      "@id": "https://simart.me/#logo",
      "url": "https://simart.me/uploads/systems/logo.webp",
      "width": 512,
      "height": 512,
      "caption": "Şımart Teknoloji"
    },
    "image": { "@id": "https://simart.me/#logo" },
    "description": "Şımart Teknoloji, Türkiye'nin ilk yerli robot süpürge markasıdır. Robot süpürge, hava temizleyici ve cam silme robotu kategorilerinde yenilikçi akıllı ev ürünleri üretmektedir.",
    "slogan": "Akıllı teknoloji, konforlu yaşam",
    "foundingDate": "2020",
    "areaServed": {
      "@type": "Country",
      "name": "Türkiye"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ankara",
      "addressRegion": "Ankara",
      "addressCountry": "TR"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+90-850-346-6126",
        "contactType": "customer support",
        "contactOption": "TollFree",
        "availableLanguage": {
          "@type": "Language",
          "name": "Turkish"
        },
        "areaServed": "TR",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        }
      },
      {
        "@type": "ContactPoint",
        "telephone": "+90-552-642-8208",
        "contactType": "technical support",
        "availableLanguage": {
          "@type": "Language",
          "name": "Turkish"
        },
        "areaServed": "TR"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/simartteknoloji/",
      "https://www.facebook.com/simartteknoloji",
      "https://www.youtube.com/c/%C5%9E%C4%B1martTeknoloji",
      "https://x.com/simartteknoloji",
      "https://www.linkedin.com/company/%C5%9F%C4%B1mart-teknoloji/",
      "https://www.trendyol.com/simart-teknoloji-x-b159326"
    ],
    "knowsAbout": [
      "Robot süpürge",
      "Hava temizleyici",
      "Cam silme robotu",
      "Akıllı ev sistemleri",
      "IoT çözümleri",
      "Ev otomasyonu"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Şımart Akıllı Ev Ürünleri",
      "itemListElement": [
        { "@type": "OfferCatalog", "name": "Robot Süpürge", "url": "https://simart.me/magaza/robotlar/" },
        { "@type": "OfferCatalog", "name": "Cam Silme Robotu", "url": "https://simart.me/magaza/robotlar/cam-temizleme-robotu" },
        { "@type": "OfferCatalog", "name": "Hava Temizleyici", "url": "https://simart.me/magaza/" },
        { "@type": "OfferCatalog", "name": "Güvenlik Sistemleri", "url": "https://simart.me/magaza/" },
        { "@type": "OfferCatalog", "name": "Akıllı Ev Aletleri", "url": "https://simart.me/magaza/" }
      ]
    }
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://simart.me/#website",
    "url": "https://simart.me/",
    "name": "Şımart Teknoloji",
    "description": "Türkiye'nin ilk yerli robot süpürge markası — robot süpürge, hava temizleyici ve cam silme robotu.",
    "publisher": { "@id": "https://simart.me/#organization" },
    "inLanguage": "tr-TR",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://simart.me/?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://simart.me/#webpage",
    "url": "https://simart.me/",
    "name": "Robot Süpürge, Hava Temizleyici & Cam Silme Robotu | Şımart Teknoloji",
    "isPartOf": { "@id": "https://simart.me/#website" },
    "about": { "@id": "https://simart.me/#organization" },
    "description": "Şımart Teknoloji — Türkiye'nin ilk yerli robot süpürgesi. katya serisi robot süpürge, cam silme robotu ve hava temizleyici ürünleri. 48 saat çözüm garantili teknik servis.",
    "inLanguage": "tr-TR",
    "breadcrumb": { "@id": "https://simart.me/#breadcrumb" }
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://simart.me/#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://simart.me/"
      }
    ]
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://simart.me/#product-list",
    "name": "Öne Çıkan Ürünler",
    "description": "Şımart Teknoloji öne çıkan robot süpürge, cam silme robotu ve hava temizleyici ürünleri",
    "numberOfItems": 3,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://simart.me/magaza/robotlar/katya-u-akilli-robot-supurge"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://simart.me/magaza/robotlar/cam-temizleme-robotu"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "url": "https://simart.me/magaza/robotlar/"
      }
    ]
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://simart.me/#faqpage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Şımart robot süpürge diğer markalardan farkı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Şımart, Türkiye'nin ilk yerli robot süpürge markasıdır. Tüm <a href='https://simart.me/magaza/robotlar/'>katya serisi robot süpürge</a> modelleri yerli mühendisler tarafından geliştirilmiş olup, satış sonrası 48 saat çözüm garantili Türkçe teknik servis ile desteklenmektedir. Yabancı markalarda yaşanan yedek parça ve servis sorunlarının aksine, Şımart'ta doğrudan Türkçe konuşan müşteri temsilcisine ulaşabilirsiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Robot süpürge halı ve parke zeminlerde kullanılabilir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, Şımart <a href='https://simart.me/magaza/robotlar/'>robot süpürge</a> modelleri halı, parke, seramik ve laminat dahil tüm zemin türlerinde kullanılabilir. katya serisi, halıyı otomatik algılayarak emiş gücünü artırır. Ayrıca ıslak-kuru silme özelliğiyle paspas da yapar."
        }
      },
      {
        "@type": "Question",
        "name": "Cam silme robotu güvenli midir, düşme riski var mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Şımart <a href='https://simart.me/magaza/robotlar/cam-temizleme-robotu'>cam silme robotu</a>, elektrik kesintisi gibi durumlarda yaklaşık 30 dakika cam yüzeyde tutunabilir. Güçlü vakum sistemi ve denge kontrol sensörleri sayesinde çalışma süresince yüzeyde güvenle kalır. Ek güvenlik için ürünle birlikte gelen koruma halatı kullanılabilir."
        }
      },
      {
        "@type": "Question",
        "name": "Hava temizleyici hangi partikülleri filtreler?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Şımart <b>hava temizleyici</b> ürünleri, HEPA filtreleme teknolojisi ile toz, alerjen, evcil hayvan tüyü, polen ve zararlı ince partikülleri (PM2.5) filtreler. Kapalı alan hava kalitesini artırarak astım ve alerjisi olan bireyler için sağlıklı bir yaşam ortamı oluşturur."
        }
      },
      {
        "@type": "Question",
        "name": "Robot süpürge internet bağlantısı olmadan çalışır mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Şımart <a href='https://simart.me/magaza/robotlar/'>katya robot süpürge</a> serisi, hem uygulama üzerinden Wi-Fi bağlantısıyla hem de kumanda ile internet bağlantısı olmadan çalışabilir. İnternet olmadan da haritalama, oda seçimi ve programlama gibi temel özellikler aktif kalmaya devam eder."
        }
      },
      {
        "@type": "Question",
        "name": "Cam silme robotu cam dışında başka yüzeylerde kullanılabilir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Şımart <a href='https://simart.me/magaza/robotlar/cam-temizleme-robotu'>cam silme robotu</a>, cam yüzeylerin yanı sıra tezgah, masa ve düz fayans yüzeylerde de etkili temizlik yapar. Sadece su eklenerek kullanılabilir; kimyasal gerektirmez. Mikrofiber bezler yıkanıp tekrar kullanılabilir."
        }
      },
      {
        "@type": "Question",
        "name": "Şımart ürünlerinin garantisi ne kadar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tüm Şımart Teknoloji ürünleri resmi Türkiye garantisi kapsamındadır ve satış sonrası <b>48 saat içinde kesin çözüm</b> garantisiyle teknik servis hizmetine sahiptir. Garanti ve servis için <a href='https://simart.me/'>simart.me</a> üzerinden veya +90 850 346 6126 numaralı ücretsiz hattı arayarak destek alabilirsiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Şımart Teknoloji'de hangi ürün kategorileri mevcuttur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Şımart Teknoloji; <a href='https://simart.me/magaza/robotlar/'>robot süpürge (katya serisi)</a>, cam silme robotu, hava temizleyici, güvenlik kameraları, akıllı prizler, aydınlatma ve mutfak aletleri kategorilerinde ürün sunmaktadır. Tüm kategoriler <a href='https://simart.me/magaza/'>simart.me/magaza</a> adresinden incelenebilir."
        }
      }
    ]
  };

  const katyaU = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://simart.me/#product-katya-u",
    "name": "katya U Akıllı Robot Süpürge",
    "description": "Ultra güçlü emiş, otomatik mop yıkama ve dToF lazer haritalama teknolojisiyle donatılmış Şımart'ın amiral gemisi robot süpürgesi. Aynı anda süpürme ve paspas yapma özelliği.",
    "brand": {
      "@type": "Brand",
      "name": "Şımart",
      "url": "https://simart.me/"
    },
    "manufacturer": { "@id": "https://simart.me/#organization" },
    "url": "https://simart.me/magaza/robotlar/katya-u-akilli-robot-supurge",
    "image": "https://simart.me/magaza/robotlar/katya-u-akilli-robot-supurge",
    "category": "Robot Süpürge",
    "keywords": "robot süpürge, akıllı robot süpürge, katya U, yerli robot süpürge",
    "countryOfOrigin": {
      "@type": "Country",
      "name": "Türkiye"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://simart.me/magaza/robotlar/katya-u-akilli-robot-supurge",
      "priceCurrency": "TRY",
      "price": "25499.00",

      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@id": "https://simart.me/#organization" },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "TRY"
        },
        "doesNotShip": false,
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "TR"
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "166",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const camSilme = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://simart.me/#product-cam-silme",
    "name": "Şımart Cam Silme Robotu",
    "description": "Akıllı sensörlü, uygulama ve kumanda kontrollü cam temizleme robotu. 2600Pa emiş gücü, otomatik rota planlama ve 30 dakika güvenlik tutunma özelliği ile cam ve yüzey temizliği.",
    "brand": {
      "@type": "Brand",
      "name": "Şımart",
      "url": "https://simart.me/"
    },
    "manufacturer": { "@id": "https://simart.me/#organization" },
    "url": "https://simart.me/magaza/robotlar/cam-temizleme-robotu",
    "image": "https://simart.me/magaza/robotlar/cam-temizleme-robotu",
    "category": "Cam Silme Robotu",
    "keywords": "cam silme robotu, cam temizleme robotu, akıllı cam robotu",
    "countryOfOrigin": {
      "@type": "Country",
      "name": "Türkiye"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://simart.me/magaza/robotlar/cam-temizleme-robotu",
      "priceCurrency": "TRY",
      "price": "6999.00",

      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@id": "https://simart.me/#organization" },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "TRY"
        },
        "doesNotShip": false,
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "TR"
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "18",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const katyaZ = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://simart.me/#product-katya-z",
    "name": "katya Z Akıllı Robot Süpürge",
    "description": "3500Pa güçlü emiş ve 150 dakika pil ömrüyle Şımart katya Z robot süpürge. Lazer haritalama, otomatik şarj dönüşü ve ıslak-kuru silme özelliği.",
    "brand": {
      "@type": "Brand",
      "name": "Şımart",
      "url": "https://simart.me/"
    },
    "manufacturer": { "@id": "https://simart.me/#organization" },
    "url": "https://simart.me/magaza/robotlar/katyaz-akilli-robot-supurge",
    "image": "https://simart.me/magaza/robotlar/katyaz-akilli-robot-supurge",
    "category": "Robot Süpürge",
    "keywords": "robot süpürge, katya Z, akıllı robot süpürge, yerli robot süpürge",
    "countryOfOrigin": {
      "@type": "Country",
      "name": "Türkiye"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://simart.me/magaza/robotlar/katyaz-akilli-robot-supurge",
      "priceCurrency": "TRY",
      "price": "8499.00",

      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@id": "https://simart.me/#organization" }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "729",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return [
    organization,
    website,
    webpage,
    breadcrumb,
    itemList,
    faq,
    katyaU,
    camSilme,
    katyaZ
  ];
};
