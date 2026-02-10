# Guvenlik Raporu (Ozet + Kritik Detaylar)

Tarih: 10 Subat 2026
Kapsam: `c:\Users\Simart\Desktop\simart-website`

## Ozet
Projede gizli anahtarlarin repoda tutulmasi, debug endpoint'i, odeme callback dogrulamasinin eksikligi, fazla genis proxy davranisi ve guvenlik basliklarinin (headers) bulunmamasi gibi riskler tespit edildi. Asagida kritik konular daha detayli aciklandi. Bu rapor “yapilmamasi gerekenler” ve tespit edilen riskleri kapsar.

## Yapilmamasi Gerekenler (Kisa)
- Gercek API anahtarlarini/secret'lari repo icinde tutmak.
- Prod ortamda debug endpoint acik birakmak.
- Odeme callback isteklerini dogrulamadan kabul etmek.
- Proxy ile tum cookie/header'lari ayrim yapmadan forward etmek ve detayli loglamak.
- Tum domainlerden `http`/`https` resim yuklemeye izin vermek.

## Kritik Konular (Detayli)

### 1) Gizli Anahtarlar Repoda
**Durum:** `.env` dosyasinda `API_KEY`, `SECURITY_KEY`, `TOKEN_SEC_KEY` gibi gizli anahtarlar bulunuyor.

**Neden kritik:**
- Bu anahtarlar sýzarsa, backend’e yetkisiz istekler atilabilir, HMAC dogrulama mekanizmasi bypass edilebilir ve kullanici token’lari cozulabilir.
- `.env`’nin repoda olmasi, yanlislikla versiyon kontrolune girmesi halinde kalici sýzýnti riski yaratir.

**Dosya:** `.env`

**Oneri (kisa):**
- Bu anahtarlari derhal rotasyon (degistirme) yapin.
- `.env` dosyasini repodan kaldirin ve deployment ortam degiskenleriyle yonetin.

---

### 2) Debug Endpoint ile Hassas Veri Sýzýntýsý
**Durum:** `app/api/auth/debug/route.js` endpoint’i; token varligi, token uzunlugu ve cozulmus degeri (preview) gibi bilgileri donuyor.

**Neden kritik:**
- `NODE_ENV` veya `ENVIRONMENT` yanlis ayarlanirsa (veya prod’da “development” olarak calisirsa), endpoint acik kalabilir.
- Token’e dair meta veriler saldirganlarin brute force / replay / analiz senaryolarina yardimci olabilir.

**Dosya:** `app/api/auth/debug/route.js`

**Oneri (kisa):**
- Prod buildlerde bu endpoint tamamen kaldirilmali veya ek bir auth katmani ile korunmali.
- Debug bilgileri log’da bile minimum seviyeye indirilmeli.

---

### 3) Odeme Callback Dogrulamasinin Eksikligi + Fazla Log
**Durum:** `app/api/payment/callback/route.js` odeme callback'i gelen istekleri dogrulamadan kabul ediyor. Istek basliklari ve body tam olarak loglaniyor. Ayrica GET ile de kabul ediliyor.

**Neden kritik:**
- Imza/dogrulama olmadan gelen callback’ler sahte (fake) odeme durumlari yaratabilir.
- Header/body tam loglandigi icin PII veya odeme detaylari loglarda kalici olarak saklanabilir.
- GET endpoint’i ile callback kabul etmek, isteklerin URL’de tasinmasi ve loglanmasi riskini artirir.

**Dosya:** `app/api/payment/callback/route.js`

**Oneri (kisa):**
- Mutlaka banka tarafindan gelen imza/secret dogrulama mekanizmasi eklenmeli.
- GET callback iptal edilmeli (sadece POST).
- Log’lar maskelenmeli veya sadece teknik meta veriler loglanmali.

---

### 4) Genis Proxy Davranisi ve Cookie Forward
**Durum:** `app/api/proxy/[...path]/route.js` gelen istekleri backend’e iletirken tum cookie’leri forward ediyor ve hata durumunda detayli log basiyor.

**Neden kritik:**
- Gereksiz cookie forward edilmesi session fixation veya yan etkili cookie'lerin baska domain’e sýzmasina neden olabilir.
- Hata loglarinda response datasi yazdiriliyor; bu, hassas verilerin loglarda kalmasina neden olabilir.

**Dosya:** `app/api/proxy/[...path]/route.js`

**Oneri (kisa):**
- Sadece gerekli cookie’leri whitelist ile forward edin.
- Hata loglarinda hassas alanlari maskelayin veya tamamen kaldirin.

---

### 5) Resim Kaynaklarina Sinirsiz Izin
**Durum:** `next.config.mjs` icinde `images.remotePatterns` tum domainler ve `http` icin acik.

**Neden kritik:**
- Mixed content ve tracking riskleri artar.
- Yanlis konfig, SSRF benzeri durumlara veya istemci tarafinda guvenlik/aciklik risklerine yol acabilir.

**Dosya:** `next.config.mjs`

**Oneri (kisa):**
- Sadece bilinen ve guvenilir domainleri whitelist edin.
- `http` protokolunu kapatin.

---

### 6) Guvenlik Basliklari (Headers) Eksik
**Durum:** `middleware.js` icinde herhangi bir guvenlik header’i (CSP, HSTS, X-Frame-Options, X-Content-Type-Options vb.) yok.

**Neden kritik:**
- Clickjacking, MIME sniffing, XSS etkilerini azaltacak katman yok.

**Dosya:** `middleware.js`

**Oneri (kisa):**
- Temel guvenlik header’lari ekleyin.

---

## Kisa Notlar (Orta Risk)
- `utils/serverFetch.js` ve diger log noktalarinda request/response body loglanabiliyor. Bu loglar prod’da devre disi veya maskeli olmali.

## Sonraki Adim (Istege Bagli)
- Istersen bu raporu temel alip somut duzeltme PR’i (anahtar rotasyonu, debug endpoint kaldirma, callback dogrulama, header setleri vb.) hazirlayabilirim.
