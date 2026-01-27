# Proje Güvenlik ve Performans Analiz Raporu

Bu rapor, proje kod tabanının incelenmesi sonucunda tespit edilen güvenlik açıkları, performans iyileştirme fırsatları ve kod kalitesi önerilerini içermektedir.

## 1. Güvenlik İncelemesi (Security Analysis)

### 🔴 Kritik Seviye (Critical Severity)

#### 1.1. Kontrolsüz Resim Kaynakları (`next.config.mjs`)
**Dosya:** `next.config.mjs`
**Bulgu:** `images.remotePatterns` yapılandırmasında `hostname: '**'` kullanılarak tüm dış kaynaklardan gelen resimlere izin verilmiş.
**Risk:** Bu durum, sunucunuzun kötü niyetli kişiler tarafından **Server-Side Request Forgery (SSRF)** veya resim işleme servisi üzerinden **Denial of Service (DoS)** saldırıları için kullanılmasına neden olabilir.
**Öneri:** Sadece güvenilen ve kullanılan resim sunucularının (örn: S3 bucket, CDN domaini) domainlerini `remotePatterns` listesine ekleyiniz. Kod taraması sonucunda `simart.me` domaininin kullanıldığı tespit edilmiştir.

```javascript
// MEVCUT (GÜVENSİZ)
remotePatterns: [
  { protocol: 'https', hostname: '**' },
]

// ÖNERİLEN
remotePatterns: [
  { protocol: 'https', hostname: 'simart.me' },
  // Geliştirme ortamı için localhost gerekebilir
  { protocol: 'http', hostname: 'localhost' },
]
```

### 🟠 Orta/Yüksek Seviye (Medium/High Severity)

#### 1.2. Zayıf Kriptografik Uygulama (`utils/auth.js`)
**Dosya:** `utils/auth.js` -> `decryptToken` fonksiyonu
**Bulgu:** Şifreleme anahtarı türetilirken `secretKey` doğrudan `SHA-256` ile hashleniyor. Herhangi bir "salt" veya yineleme (iteration) kullanılmıyor.
**Risk:** Eğer `secretKey` yeterince karmaşık değilse, "Rainbow Table" saldırıları veya brute-force yöntemleriyle çözülebilir. Ayrıca Web Crypto API kullanımı manuel byte manipülasyonları içeriyor (`slice`, `atob`), bu da hata yapmaya açıktır.
**Öneri:** PBKDF2 veya Argon2 gibi standart anahtar türetme fonksiyonları kullanın. Mümkünse `jose` veya `iron-session` gibi kendini kanıtlamış kütüphaneleri tercih edin.

#### 1.3. User-Agent Spoofing ve Cloudflare Evasion (`utils/serverFetch.js`)
**Dosya:** `utils/serverFetch.js`
**Bulgu:** Kod, istekleri Chrome tarayıcısı gibi göstermek için sahte bir `User-Agent` kullanıyor ve Cloudflare challenge'larını tespit etmeye çalışıyor (`isCloudflareChallenge`).
**Risk:** Bu, uygulamanızın backend'inin aslında public bir API olmadığını veya korunduğunu gösterir. Cloudflare kuralları değişirse uygulamanız çalışamaz hale gelir.
**Durum:** Kullanıcı tarafından bu madde ile ilgili güncelleme yapıldığı belirtilmiştir. (Gözden Geçirildi/Çözüldü)

### 🟡 Düşük Seviye (Low Severity)

#### 1.4. Proxy Üzerinden Hassas Veri İletimi (`app/api/proxy`)
**Dosya:** `app/api/proxy/[...path]/route.js`
**Bulgu:** Proxy rotası, `process.env` üzerindeki anahtarları kullanarak backend'e istek atıyor.
**Risk:** Eğer backend URL'i veya path validasyonu tam yapılmazsa (gerçi `[...path]` yapısı bir miktar korur), SSRF riski oluşabilir.
**Öneri:** `path` parametresini sadece izin verilen endpointlerle sınırlandırın (whitelist).

---

## 2. Performans İncelemesi (Performance Analysis)

### 🔴 Kritik Seviye

#### 2.1. Önbelleklemenin Devre Dışı Bırakılması (`api/products.js`)
**Dosya:** `api/products.js`
**Bulgu:** Tüm veri çekme fonksiyonlarında `{ next: { revalidate: 0 } }` kullanılmış.
**Etki:** Bu, Next.js'in statik üretim (SSG) ve artımlı statik yenileme (ISR) özelliklerini tamamen devre dışı bırakır. Sayfanıza gelen **her istek** için backend sunucusuna yeni bir istek atılır. Bu, sayfa yüklenme hızını ciddi şekilde yavaşlatır ve backend yükünü artırır.
**Öneri:** Verinin değişme sıklığına göre `revalidate: 60` (1 dakika) veya `revalidate: 3600` (1 saat) gibi değerler kullanın.

### 🟠 Orta Seviye

#### 2.2. Agresif Retry Mekanizması (`utils/serverFetch.js`)
**Dosya:** `utils/serverFetch.js`
**Bulgu:** Hata durumunda 3 kez retry yapılıyor ve her seferinde bekleniyor.
**Etki:** Backend kapalıysa veya hata veriyorsa, kullanıcının hata mesajını görmesi çok uzun sürer (Timeout x 3).
**Öneri:** Retry sayısını düşürün veya "Circuit Breaker" pattern kullanın.

#### 2.3. Axios Kullanımı (`apiClient.js`)
**Dosya:** `utils/apiClient.js`
**Bulgu:** Next.js 13+ (App Router) ile yerleşik `fetch` API'si, önbellekleme mekanizmalarıyla daha iyi entegre olur. `axios` kullanımı ekstra bundle boyutu ekler.
**Öneri:** Mümkünse yerleşik `fetch` fonksiyonuna geçiş yapın.

---

## 3. Kod Kalitesi ve Mimari (Code Quality & Architecture)

### 3.1. Klasör Yapısı
**Bulgu:** Proje kök dizininde `api/` klasörü var (`api/products.js`, `api/blogs.js`). Next.js'de `api/` genellikle API rotaları için kullanılır (Pages Router). Ancak bu dosyalar sadece veri çekme yardımcıları (service/utility).
**Öneri:** Bu dosyaları `lib/services/` veya `services/` altına taşıyarak `app/api/` (gerçek API rotaları) ile karıştırılmasını engelleyin.

### 3.2. Manuel Cookie Yönetimi (`app/api/proxy`)
**Bulgu:** Proxy rotasında cookie'lerin string manipülasyonu ile manuel olarak parse edilip oluşturulduğu görülüyor.
**Öneri:** Bu yöntem hataya açıktır. `cookies()` API'sini daha etkin kullanın veya cookie yönetimi için sağlam bir kütüphane/helper kullanın.

### 3.3. Karmaşık Sorumluluklar (`utils/serverFetch.js`)
**Bulgu:** `serverFetch` fonksiyonu hem veri çekme, hem imzalama (HMAC), hem loglama, hem de Cloudflare tespiti yapıyor.
**Öneri:** Bu fonksiyonu daha küçük parçalara bölün (örn: `signRequest`, `handleError`, `fetchData`).

---

## Özet ve Öncelikli Aksiyon Planı

1. **Hemen Yapılmalı:** `next.config.mjs` dosyasındaki `remotePatterns` kısıtlanmalı.
2. **Hemen Yapılmalı:** `api/products.js` içindeki `revalidate: 0` kaldırılmalı veya makul bir süreye çekilmeli.
3. **Planlanmalı:** Auth yapısındaki şifreleme mantığı daha güvenli bir kütüphane ile değiştirilmeli.
4. **Planlanmalı:** `api/` klasörü `services/` olarak yeniden adlandırılmalı.
