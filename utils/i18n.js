import { i18n, localizedRoutes } from "@/config/i18n";

/**
 * URL'yi seçili dile göre yerelleştirir ve slugları eşler.
 * @param {string} url - Orijinal URL
 * @param {string} lang - Hedef dil kodu
 * @returns {string} Yerelleştirilmiş URL
 */
export function getLocalizedUrl(url, lang) {
    if (!url || url === "#" || url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:")) {
        return url;
    }

    // Orijinal temiz path
    let cleanUrl = url.startsWith("/") ? url : `/${url}`;

    // İngilizce için slugları eşle
    if (lang === "en" && localizedRoutes.en) {
        // En spesifik olanı (en uzun olanı) önce eşleştirmek için sırala
        const sortedRoutes = Object.entries(localizedRoutes.en).sort(
            (a, b) => b[0].length - a[0].length
        );

        for (const [trSlug, enSlug] of sortedRoutes) {
            const trPath = trSlug.startsWith('/') ? trSlug : `/${trSlug}`;
            const enPath = enSlug.startsWith('/') ? enSlug : `/${enSlug}`;

            if (cleanUrl === trPath) {
                cleanUrl = enPath;
                break; // Tam eşleşme bulunduğunda dur
            } else if (cleanUrl.startsWith(`${trPath}/`)) {
                cleanUrl = cleanUrl.replace(new RegExp(`^${trPath}(\\/|$)`), `${enPath}$1`);
                break; // Başlangıç eşleşmesi bulunduğunda dur
            }
        }
    }

    // Varsayılan dil (tr) ise prefix ekleme
    if (lang === i18n.defaultLocale) {
        return cleanUrl;
    }

    // Eğer URL zaten bir dil prefixi ile başlıyorsa (örn: /en/...), tekrar ekleme
    const hasLocalePrefix = i18n.locales.some(
        (locale) => cleanUrl.startsWith(`/${locale}/`) || cleanUrl === `/${locale}`
    );

    if (hasLocalePrefix) {
        return cleanUrl;
    }

    // Prefix ekle: /en + /shop -> /en/shop
    return `/${lang}${cleanUrl}`;
}

export function translatePath(pathname, targetLocale) {
    if (!pathname || pathname === "/") return `/${targetLocale === i18n.defaultLocale ? "" : targetLocale}`;

    const segments = pathname.split("/").filter(Boolean);
    let currentLocale = i18n.defaultLocale;

    // Mevcut dili belirle ve temizle
    if (i18n.locales.includes(segments[0])) {
        currentLocale = segments.shift();
    }

    let innerPath = segments.join("/");

    // 1. TAM PATH EŞLEŞMESİ KONTROLÜ (Daha spesifik: kurumsal/hikayemiz gibi)
    // Eğer EN -> TR ise (reverse lookup)
    if (currentLocale !== i18n.defaultLocale && targetLocale === i18n.defaultLocale) {
        const trPath = Object.keys(localizedRoutes[currentLocale]).find(
            key => localizedRoutes[currentLocale][key] === innerPath
        );
        if (trPath) innerPath = trPath;
    } 
    // Eğer TR -> EN ise
    else if (currentLocale === i18n.defaultLocale && targetLocale !== i18n.defaultLocale) {
        if (localizedRoutes[targetLocale][innerPath]) {
            innerPath = localizedRoutes[targetLocale][innerPath];
        }
    }
    // Eğer EN -> FR gibi bir şeyse (bu projede yok ama genel mantık)
    else if (currentLocale !== i18n.defaultLocale && targetLocale !== i18n.defaultLocale) {
        // Önce TR'ye çevir sonra hedefe
        const trPath = Object.keys(localizedRoutes[currentLocale]).find(
            key => localizedRoutes[currentLocale][key] === innerPath
        ) || innerPath;
        innerPath = localizedRoutes[targetLocale][trPath] || trPath;
    }

    // 2. SEGMENT TABANLI FALLBACK (Eğer tam eşleşme bulunamadıysa)
    if (innerPath === segments.join("/")) {
        let originalSegments = segments.map(segment => {
            if (currentLocale !== i18n.defaultLocale && localizedRoutes[currentLocale]) {
                const trSlug = Object.keys(localizedRoutes[currentLocale]).find(
                    key => localizedRoutes[currentLocale][key] === segment
                );
                return trSlug || segment;
            }
            return segment;
        });

        let translatedSegments = originalSegments.map(segment => {
            if (targetLocale !== i18n.defaultLocale && localizedRoutes[targetLocale]) {
                return localizedRoutes[targetLocale][segment] || segment;
            }
            return segment;
        });
        
        innerPath = translatedSegments.join("/");
    }

    // Yeni URL'yi oluştur
    const prefix = targetLocale === i18n.defaultLocale ? "" : `/${targetLocale}`;
    const result = `${prefix}/${innerPath}`.replace(/\/+$/, "");

    return result || "/";
}
