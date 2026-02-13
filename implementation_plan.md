# İmplemantasyon Planı - Sepet İpuçlarında Ürün Adı Gösterimi

Bu plan, sepet içerisinde gösterilen kampanya ipuçlarının (`cart_tips`) hangi ürünle ilgili olduğunu kullanıcıya daha net belirtmek için ürün adının mesajın başına eklenmesini kapsar.

## Değişiklikler

### 1. `components/modals/ShopCart.jsx`
- `totals.cart_tips` döngüsü içerisinde, mesaj yazdırılmadan önce `tip.product_name` kontrolü yapılacak.
- Eğer `product_name` mevcutsa, mesajın başına kalın punto ile ("Ürün Adı: ") şeklinde eklenecek.

### 2. `components/othersPages/checkout/OrderSummary.jsx` (Opsiyonel ama tutarlılık için önerilir)
- Eğer bu bileşende `cart_tips` henüz gösterilmiyorsa, sepet özeti kısmına eklenecek.
- Gösterim formatı modal ile aynı olacak.

## Kontrol Listesi
- [ ] Modal sepetinde ürün adı görünüyor mu?
- [ ] Ürün adı olmayan ipuçları hata vermeden çalışıyor mu?
- [ ] (Varsa) Ödeme sayfası özetinde ipuçları görünüyor mu?
