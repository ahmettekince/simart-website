/** Türkçe ve yaygın HTML entity'leri */
const HTML_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
  "&uuml;": "ü", "&Uuml;": "Ü",
  "&ouml;": "ö", "&Ouml;": "Ö",
  "&ccedil;": "ç", "&Ccedil;": "Ç",
  "&igrave;": "ì", "&agrave;": "à", "&egrave;": "è",
  "&eacute;": "é", "&aacute;": "á", "&iacute;": "í",
  "&uacute;": "ú", "&ntilde;": "ñ", "&szlig;": "ß",
};

/**
 * HTML entity'lerini decode eder (&uuml; → ü vb.)
 * @param {string} str - HTML entity'li string
 * @returns {string} Decode edilmiş string
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return "";
  let s = str;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    s = s.split(entity).join(char);
  }
  s = s.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return s;
}

/**
 * HTML içeriğini meta description için düz metne çevirir.
 * Etiketleri kaldırır, HTML entity'leri decode eder.
 * @param {string} html - HTML string
 * @param {number} maxLength - Maksimum karakter (varsayılan 160)
 * @returns {string} Düz metin
 */
export function stripHtmlForMeta(html, maxLength = 160) {
  if (!html || typeof html !== "string") return "";

  let text = html
    .replace(/<[^>]*>/g, " ") // HTML etiketlerini boşlukla değiştir
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/\s+/g, " ") // Birden fazla boşluğu tek boşluğa indir
    .trim();

  return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text;
}

/**
 * HTML içindeki tüm <img> etiketlerine loading="lazy" ekler (açıklama görselleri için).
 * @param {string} html - HTML string
 * @returns {string} Güncellenmiş HTML
 */
export function addLazyLoadToDescriptionImages(html) {
  if (!html || typeof html !== "string") return html;
  // Hem resimlere lazy load ekle
  let processed = html.replace(/<img\s/gi, '<img loading="lazy" ');

  // Videoları işle: 
  // 1. Controls'leri kaldır
  // 2. playsinline, autoplay, muted, loop ekle (animasyon gibi çalışması için)
  processed = processed.replace(/<video\s([^>]*)>/gi, (match, attrs) => {
    // Mevcut baz etiketleri temizle ve zorunlu olanları ekle
    let cleanAttrs = attrs
      .replace(/\bcontrols\b/gi, '')
      .replace(/\bplaysinline\b/gi, '')
      .replace(/\bwebkit-playsinline\b/gi, '')
      .replace(/\bautoplay\b/gi, '')
      .replace(/\bmuted\b/gi, '')
      .replace(/\bloop\b/gi, '');

    return `<video ${cleanAttrs.trim()} playsinline webkit-playsinline autoplay muted loop>`;
  });

  return processed;
}
