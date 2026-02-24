# JS Azaltma ve Performans Optimizasyonu Planı

Bu plan, uygulamanın istemci tarafındaki (client-side) JavaScript yükünü azaltmak ve sayfa açılış hızlarını artırmak için tasarlanmıştır.

## 1. Dinamik Bileşen Yükleme (next/dynamic)
Kullanıcı bir butona basana kadar görünmeyen veya sayfanın alt kısmında kalan ağır bileşenleri dinamik olarak yükleyeceğiz.
- **Hedefler**: `ShopCart`, `SearchModal`, `GlobalGiftSelectionModal`.

## 2. Server Components Kullanımını Artırma
Next.js'in "Server First" yaklaşımını kullanarak, sadece etkileşim (onClick, state vb.) gerektiren uç bileşenleri `"use client"` olarak işaretleyeceğiz. Layout ve büyük veri işleme kısımlarını sunucuda bırakacağız.

## 3. Kütüphane Optimizasyonu
- **Model Viewer**: 3D modelleri (`@google/model-viewer`) sadece ilgili ürün sayfasında ve görünür olduğunda yükleyeceğiz.
- **Swiper/Bootstrap**: Bu kütüphanelerin sadece gerekli modüllerini import edeceğiz.
- **Drift vs React-Image-Zoom**: İki farklı zoom kütüphanesini tek bir yapıya indireceğiz.

## 4. İstatistik ve İzleme Kodları (Analytics)
Third-party scriptleri `next/script` ile `lazyOnload` stratejisi kullanarak, ana JS thread'ini bloklamadan yükleyeceğiz.

---

### İlk Adım: ClientLayout Optimizasyonu
`ClientLayout.jsx` içindeki her zaman yüklenen ama nadir kullanılan modalları dinamik hale getiriyoruz.
