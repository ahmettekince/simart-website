export const i18n = {
    defaultLocale: "tr",
    locales: ["tr", "en"],
};

export const localizedRoutes = {
    en: {
        "magaza": "shop",
        "iletisim": "contact",
        "destek": "support",
        "sss": "faq",
        "kurumsal": "corporate",
        "kurumsal/biz-kimiz": "corporate/about-us",
        "kurumsal/hikayemiz": "corporate/our-story",
        "kurumsal/neler-yapiyoruz": "corporate/what-we-do",
        "kurumsal/odullerimiz": "corporate/our-awards",
        "kurumsal/etkinliklerimiz": "corporate/our-events",
        "kurumsal/kilometre-taslari": "corporate/milestones",
        "kurumsal/sertifikalar": "corporate/certificates",
        "kurumsal/kariyer": "corporate/careers",
        "kurumsal/basinda-biz": "corporate/press",
        "sepetim": "cart",
        "hesabim": "my-account",
        "siparislerim": "my-orders",
        "adreslerim": "my-addresses",
        "degerlendirmelerim": "my-reviews",
        "kupon-kodlarim": "my-coupons",
        "paylas-simart": "share-simart",
        "odeme": "checkout",
        "giris-yap": "login",
        "kayit-ol": "register",
        "sifremi-unuttum": "forgot-password",
        "kargo-takip": "track-order"
    }
};

export const getLocaleDisplayName = (locale) => {
    const names = {
        tr: "Türkçe",
        en: "English",
    };
    return names[locale] || locale;
};
