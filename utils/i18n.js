import { i18n } from "@/config/i18n";

/**
 * URL'yi seçili dile göre yerelleştirir.
 * @param {string} url - Orijinal URL
 * @param {string} lang - Hedef dil kodu
 * @returns {string} Yerelleştirilmiş URL
 */
export function getLocalizedUrl(url, lang) {
    if (!url || url === "#" || url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:")) {
        return url;
    }

    // Varsayılan dil (tr) ise prefix ekleme
    if (lang === i18n.defaultLocale) {
        return url;
    }

    // Eğer URL zaten bir dil prefixi ile başlıyorsa (örn: /en/...), tekrar ekleme
    const hasLocalePrefix = i18n.locales.some(
        (locale) => url.startsWith(`/${locale}/`) || url === `/${locale}`
    );

    if (hasLocalePrefix) {
        return url;
    }

    // Prefix ekle: /en + /iletisim -> /en/iletisim
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `/${lang}${cleanUrl}`;
}
