/**
 * Form input formatlama yardımcıları.
 * TC: sadece rakam, max 11 hane.
 * Vergi no: sadece rakam, max 10 hane.
 * İsim (ad/soyad/şirket): sadece harf, boşluk, tire, apostrof; rakam ve işaret yok.
 */

/** TC Kimlik No: sadece rakam, en fazla 11 karakter */
export function formatTcInput(e) {
  const v = e.target.value.replace(/\D/g, "").slice(0, 11);
  e.target.value = v;
}

/** Vergi numarası: sadece rakam, en fazla 10 karakter */
export function formatTaxNumberInput(e) {
  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
  e.target.value = v;
}

/** Kontrollü input için: TC - sadece rakam, max 11 hane */
export function filterTcValue(value) {
  if (value == null || typeof value !== "string") return "";
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Kontrollü input için: Vergi no - sadece rakam, max 10 hane */
export function filterTaxNumberValue(value) {
  if (value == null || typeof value !== "string") return "";
  return value.replace(/\D/g, "").slice(0, 10);
}

/** İsim alanları (ad, soyad, şirket adı): sadece harf (TR+EN), boşluk, tire, apostrof */
const NAME_REGEX = /[^a-zA-ZçÇğĞıİöÖşŞüÜ\s\-']/g;
export function formatNameInput(e) {
  e.target.value = e.target.value.replace(NAME_REGEX, "");
}

/** Kontrollü input için: isim değerini filtrele (rakam/işaret çıkar) */
export function filterNameValue(str) {
  if (str == null || typeof str !== "string") return "";
  return str.replace(NAME_REGEX, "");
}

/** İsim (ad): Her kelimenin ilk harfi büyük, diğerleri küçük – Türkçe uyumlu (İ, ı, ğ, ü, ş, ö, ç) */
export function formatFirstNameValue(str) {
  if (str == null || typeof str !== "string") return "";
  const cleaned = str.replace(NAME_REGEX, "");
  return cleaned
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      const lower = word.toLocaleLowerCase("tr-TR");
      return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
    })
    .join(" ");
}

/** Soyisim: Tamamen büyük harf – Türkçe uyumlu */
export function formatLastNameValue(str) {
  if (str == null || typeof str !== "string") return "";
  return str.replace(NAME_REGEX, "").toLocaleUpperCase("tr-TR");
}

/** Telefon: sadece rakam, +90 ile başlar; en fazla 12 rakam (90 + 10 hane) */
const PHONE_MAX_DIGITS = 12; // 90 + 10
export function formatPhoneWithPlus90(e) {
  const raw = e.target.value.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
  let digits = raw;
  if (digits.length && !digits.startsWith("90")) {
    if (digits.startsWith("0")) digits = "90" + digits.slice(1);
    else digits = "90" + digits;
    digits = digits.slice(0, PHONE_MAX_DIGITS);
  }
  e.target.value = digits ? "+" + digits : "";
}

/** Telefon değerini +90XXXXXXXXXX formatında döndür (kontrollü input için) */
export function formatPhoneValue(value) {
  if (value == null || typeof value !== "string") return "";
  const raw = value.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
  let digits = raw;
  if (digits.length && !digits.startsWith("90")) {
    if (digits.startsWith("0")) digits = "90" + digits.slice(1);
    else digits = "90" + digits;
    digits = digits.slice(0, PHONE_MAX_DIGITS);
  }
  return digits ? "+" + digits : "";
}
