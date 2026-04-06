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
        Object.entries(localizedRoutes.en).forEach(([trSlug, enSlug]) => {
            // Tam eşleşme veya başlangıç eşleşmesi (/magaza veya /magaza/...)
            if (cleanUrl === `/${trSlug}`) {
                cleanUrl = `/${enSlug}`;
            } else if (cleanUrl.startsWith(`/${trSlug}/`)) {
                cleanUrl = cleanUrl.replace(`/${trSlug}/`, `/${enSlug}/`);
            }
        });
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

/**
 * Mevcut bir path'i başka bir dile çevirir (slug eşleşmeleri dahil).
 * @param {string} pathname - Mevcut pathname (örn: /en/shop/kategori)
 * @param {string} targetLocale - Hedef dil (örn: tr)
 * @returns {string} Çevrilmiş pathname
 */
export function translatePath(pathname, targetLocale) {
    if (!pathname || pathname === "/") return `/${targetLocale === i18n.defaultLocale ? "" : targetLocale}`;

    const segments = pathname.split("/").filter(Boolean);
    let currentLocale = i18n.defaultLocale;

    // Mevcut dili belirle ve temizle
    if (i18n.locales.includes(segments[0])) {
        currentLocale = segments.shift();
    }

    // Slugları orijinal (tr) haline geri getir
    let originalSegments = segments.map(segment => {
        if (currentLocale !== i18n.defaultLocale && localizedRoutes[currentLocale]) {
            const trSlug = Object.keys(localizedRoutes[currentLocale]).find(
                key => localizedRoutes[currentLocale][key] === segment
            );
            return trSlug || segment;
        }
        return segment;
    });

    // Şimdi orijinal segmentleri hedef dile çevir
    let translatedSegments = originalSegments.map(segment => {
        if (targetLocale !== i18n.defaultLocale && localizedRoutes[targetLocale]) {
            return localizedRoutes[targetLocale][segment] || segment;
        }
        return segment;
    });

    // Yeni URL'yi oluştur
    const prefix = targetLocale === i18n.defaultLocale ? "" : `/${targetLocale}`;
    const path = translatedSegments.length > 0 ? `/${translatedSegments.join("/")}` : "";

    return `${prefix}${path}` || "/";
}
