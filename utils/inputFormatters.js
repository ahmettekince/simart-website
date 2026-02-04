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
