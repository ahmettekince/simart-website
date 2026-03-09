export const i18n = {
    defaultLocale: "tr",
    locales: ["tr", "en"],
};

export const getLocaleDisplayName = (locale) => {
    const names = {
        tr: "Türkçe",
        en: "English",
    };
    return names[locale] || locale;
};
