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

/** onInput: Ad (Her kelime baş harf büyük) */
export function formatFirstNameInput(e) {
  const cursor = e.target.selectionStart;
  const originalValue = e.target.value;
  const formatted = formatFirstNameValue(originalValue);
  
  if (originalValue !== formatted) {
    e.target.value = formatted;
    // İmleç konumunu korumaya çalış (basit yaklaşım)
    e.target.setSelectionRange(cursor, cursor);
  }
}

/** onInput: Soyad (Tamamı büyük) */
export function formatLastNameInput(e) {
  const cursor = e.target.selectionStart;
  const originalValue = e.target.value;
  const formatted = formatLastNameValue(originalValue);
  
  if (originalValue !== formatted) {
    e.target.value = formatted;
    e.target.setSelectionRange(cursor, cursor);
  }
}

/** Telefon: +90 5XX XXX XX XX formatında giriş için uncontrolled input yardımcısı */
export function formatPhoneWithPlus90(e) {
  const value = e.target.value;
  let digits = value.replace(/\D/g, "");

  // Baştaki ülke kodunu (90) veya sıfırı (0) temizle
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);

  digits = digits.slice(0, 10);

  let formatted = "+90";
  if (digits.length > 0) formatted += " " + digits.slice(0, 3);
  if (digits.length > 3) formatted += " " + digits.slice(3, 6);
  if (digits.length > 6) formatted += " " + digits.slice(6, 8);
  if (digits.length > 8) formatted += " " + digits.slice(8, 10);

  e.target.value = formatted;
}

/** Telefon değerini +90 5XX XXX XX XX formatında döndür (kontrollü inputlar için) */
export function formatPhoneValue(value) {
  if (value == null || typeof value !== "string" || value.trim() === "" || value.trim() === "+") return "+90";

  let digits = value.replace(/\D/g, "");

  // Sabit ülke kodunu (90) veya sıfırı (0) temizle
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);

  digits = digits.slice(0, 10);

  let formatted = "+90";
  if (digits.length > 0) formatted += " " + digits.slice(0, 3);
  if (digits.length > 3) formatted += " " + digits.slice(3, 6);
  if (digits.length > 6) formatted += " " + digits.slice(6, 8);
  if (digits.length > 8) formatted += " " + digits.slice(8, 10);

  return formatted;
}

/** 
 * Ad Soyad (Tek input):
 * - İlk kelime (İsim): Baş harfi büyük, geri kalanı küçük
 * - Diğer kelimeler (Soyisim): Tamamı büyük harf
 * - Türkçe karakter uyumlu
 */
export function formatFullNameValue(str) {
  if (str == null || typeof str !== "string") return "";

  // İzin verilen karakterler dışında her şeyi temizle (ama boşluk kalsın)
  const cleaned = str.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, "");

  // Boşluklara göre ayır
  const parts = cleaned.split(" ");

  let newFullName = "";

  if (parts.length > 0) {
    // İlk kelime: Baş harfi büyük, geri kalanı küçük
    const firstName = parts[0];
    if (firstName) {
      newFullName += firstName.charAt(0).toLocaleUpperCase("tr-TR") + firstName.slice(1).toLocaleLowerCase("tr-TR");
    }
  }

  if (parts.length > 1) {
    // İkinci ve sonraki kelimeler (Soyisim): Tamamı büyük harf
    // slice(1) ile ilk kelime hariç diğerlerini alıyoruz
    const lastNamePart = parts.slice(1).join(" ").toLocaleUpperCase("tr-TR");

    // Eğer soyisim kısmı varsa boşlukla ekle
    // (parts.length > 1 olduğuna göre bir şeyler var, ama boş string de olabilir split davranışına göre)
    if (lastNamePart.length > 0 || (parts.length === 2 && parts[1] === "")) {
      newFullName += " " + lastNamePart;
    }
  } else if (str.endsWith(" ")) {
    // Kullanıcı ilk isimi yazdıktan sonra boşluğa bastıysa boşluğu ekle
    newFullName += " ";
  }

  return newFullName;
}
