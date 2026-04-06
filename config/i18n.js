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
        "sepetim": "cart"
    }
};

export const getLocaleDisplayName = (locale) => {
    const names = {
        tr: "Türkçe",
        en: "English",
    };
    return names[locale] || locale;
};
