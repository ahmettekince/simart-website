# Zustand State Management Dokümantasyonu

Bu dokümantasyon, projede Zustand ile state management kullanımını açıklar.

## 📚 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Kurulum](#kurulum)
- [Store Yapısı](#store-yapısı)
- [Cart Store Kullanımı](#cart-store-kullanımı)
- [Best Practices](#best-practices)
- [API Entegrasyonu](#api-entegrasyonu)

---

## Genel Bakış

Bu projede **Zustand** kullanarak atomik (atomic) state management yapısı kurulmuştur. Zustand, React için hafif, hızlı ve ölçeklenebilir bir state management çözümüdür.

### Neden Zustand?

- ✅ **Hafif**: ~1KB boyut
- ✅ **Basit API**: Öğrenmesi ve kullanması kolay
- ✅ **TypeScript desteği**: Tam tip güvenliği
- ✅ **Middleware desteği**: Persist, devtools vb.
- ✅ **Atomik yapı**: Her store bağımsız çalışır

---

## Kurulum

Zustand zaten projeye eklenmiştir:

```json
{
  "dependencies": {
    "zustand": "^5.0.10"
  }
}
```

### Yeni Store Oluşturma

Yeni bir store oluşturmak için `stores/` dizininde yeni bir dosya oluşturun:

```javascript
// stores/wishlistStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => set((state) => ({
        items: [...state.items, productId]
      })),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(id => id !== productId)
      })),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## Store Yapısı

### Dizin Yapısı

```
stores/
  ├── cartStore.js          # Sepet yönetimi
  ├── wishlistStore.js      # Favoriler (gelecek)
  └── compareStore.js       # Karşılaştırma (gelecek)
```

### Store Naming Convention

- Store dosyaları: `camelCase` (örn: `cartStore.js`)
- Store hook'ları: `use` prefix ile (örn: `useCartStore`)
- Store isimleri: `kebab-case` (örn: `cart-storage`)

---

## Cart Store Kullanımı

### Temel Kullanım

```javascript
"use client";
import { useCartStore } from "@/stores/cartStore";

export default function ProductCard({ product }) {
  // Store'dan state ve actions al
  const { items, totalPrice, addItem, removeItem, isInCart } = useCartStore();

  // Sepete ekle
  const handleAddToCart = () => {
    addItem(product, 1, true); // product, quantity, openModal
  };

  // Sepetten çıkar
  const handleRemoveFromCart = () => {
    removeItem(product.id);
  };

  // Sepette var mı kontrol et
  const inCart = isInCart(product.id);

  return (
    <div>
      <button onClick={handleAddToCart}>
        {inCart ? 'Sepette' : 'Sepete Ekle'}
      </button>
      {inCart && (
        <button onClick={handleRemoveFromCart}>Çıkar</button>
      )}
    </div>
  );
}
```

### Store API

#### State

```javascript
const { items, totalPrice, totalItems } = useCartStore();
```

- **`items`**: `CartItem[]` - Sepetteki ürünler
- **`totalPrice`**: `number` - Toplam fiyat (computed)
- **`totalItems`**: `number` - Toplam ürün sayısı (computed)

#### Actions

```javascript
const { 
  addItem,           // Sepete ürün ekle
  updateQuantity,    // Miktar güncelle
  removeItem,        // Sepetten çıkar
  isInCart,          // Sepette var mı?
  getItem,           // Ürün getir
  clearCart          // Sepeti temizle
} = useCartStore();
```

#### `addItem(product, quantity?, openModal?)`

Sepete ürün ekler.

```javascript
// Basit kullanım
addItem(product);

// Miktar belirterek
addItem(product, 3);

// Modal açarak
addItem(product, 1, true);
```

#### `updateQuantity(productId, quantity)`

Ürün miktarını günceller.

```javascript
updateQuantity(product.id, 5); // 5 adet yap
```

#### `removeItem(productId)`

Sepetten ürün çıkarır.

```javascript
removeItem(product.id);
```

#### `isInCart(productId)`

Ürünün sepette olup olmadığını kontrol eder.

```javascript
const inCart = isInCart(product.id);
if (inCart) {
  // Sepette var
}
```

#### `getItem(productId)`

Sepetteki ürünü getirir.

```javascript
const cartItem = getItem(product.id);
if (cartItem) {
  console.log('Miktar:', cartItem.quantity);
}
```

#### `clearCart()`

Sepeti tamamen temizler.

```javascript
clearCart();
```

---

## Best Practices

### 1. Selector Kullanımı

Store'dan sadece ihtiyacınız olan değerleri alın (re-render optimizasyonu):

```javascript
// ❌ Kötü: Tüm store'u alır
const cartStore = useCartStore();

// ✅ İyi: Sadece ihtiyaç olan değerleri al
const items = useCartStore((state) => state.items);
const addItem = useCartStore((state) => state.addItem);
```

### 2. Computed Values

Computed değerler (totalPrice, totalItems) her zaman günceldir, ayrıca hesaplamaya gerek yok:

```javascript
// ✅ Doğru
const totalPrice = useCartStore((state) => state.totalPrice);

// ❌ Yanlış (gereksiz hesaplama)
const items = useCartStore((state) => state.items);
const totalPrice = items.reduce(...);
```

### 3. Component İçinde Kullanım

```javascript
"use client"; // Client component olmalı
import { useCartStore } from "@/stores/cartStore";

export default function MyComponent() {
  const addItem = useCartStore((state) => state.addItem);
  // ...
}
```

### 4. Server Component'lerde Kullanım

Zustand store'ları sadece **Client Component**'lerde kullanılabilir. Server Component'lerde kullanmayın:

```javascript
// ❌ Server Component - Çalışmaz
import { useCartStore } from "@/stores/cartStore";

export default async function ServerComponent() {
  const items = useCartStore((state) => state.items); // HATA!
}

// ✅ Client Component - Çalışır
"use client";
import { useCartStore } from "@/stores/cartStore";

export default function ClientComponent() {
  const items = useCartStore((state) => state.items); // OK
}
```

---

## API Entegrasyonu

### Gelecek: API Senkronizasyonu

Cart store'u API ile senkronize etmek için middleware veya action'lar eklenebilir:

```javascript
// stores/cartStore.js (gelecek)
addItem: async (product, quantity = 1) => {
  // 1. Local state'i güncelle
  // ... mevcut kod

  // 2. API'ye gönder
  try {
    await fetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity })
    });
  } catch (error) {
    // Hata durumunda rollback
    console.error('API hatası:', error);
  }
}
```

### API Endpoint'leri (Gelecek)

- `POST /api/cart/add` - Sepete ekle
- `PUT /api/cart/update` - Miktar güncelle
- `DELETE /api/cart/remove` - Sepetten çıkar
- `GET /api/cart` - Sepeti getir
- `POST /api/cart/sync` - Local storage ile senkronize et

---

## Örnekler

### Product Card'da Kullanım

```javascript
"use client";
import { useCartStore } from "@/stores/cartStore";
import Button from "@/components/common/Button";

export default function ProductCardSimart({ product }) {
  const { addItem, isInCart } = useCartStore();

  const handleAddToCart = () => {
    addItem(product, 1, false); // Modal açma
  };

  const inCart = isInCart(product.id);

  return (
    <Button
      onClick={handleAddToCart}
      text={inCart ? "Sepette" : "Sepete Ekle"}
      disabled={inCart}
    />
  );
}
```

### Cart Page'de Kullanım

```javascript
"use client";
import { useCartStore } from "@/stores/cartStore";

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return <div>Sepetiniz boş</div>;
  }

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeItem(item.id)}>Sil</button>
        </div>
      ))}
      <div>Toplam: {totalPrice.toLocaleString('tr-TR')}₺</div>
      <button onClick={clearCart}>Sepeti Temizle</button>
    </div>
  );
}
```

### Cart Badge (Header'da)

```javascript
"use client";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";

export default function CartBadge() {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <Link href="/sepetim">
      <span>Sepet ({totalItems})</span>
    </Link>
  );
}
```

---

## Migration (Context'ten Zustand'a)

Mevcut `Context.jsx`'teki cart fonksiyonları Zustand'a taşınmıştır:

| Context API | Zustand API |
|------------|-------------|
| `cartProducts` | `items` |
| `addProductToCart(id, qty)` | `addItem(product, qty)` |
| `addProductToCartDirect(product, qty)` | `addItem(product, qty, false)` |
| `updateQuantity(id, qty)` | `updateQuantity(id, qty)` |
| `isAddedToCartProducts(id)` | `isInCart(id)` |
| `totalPrice` | `totalPrice` |

---

## Sorun Giderme

### Store güncellenmiyor

```javascript
// ❌ Yanlış: Store objesini direkt değiştirme
const store = useCartStore();
store.items.push(newItem); // Çalışmaz!

// ✅ Doğru: Action kullan
const addItem = useCartStore((state) => state.addItem);
addItem(newItem);
```

### localStorage senkronize değil

Zustand otomatik olarak localStorage'a kaydeder. Eğer sorun varsa:

1. Browser DevTools > Application > Local Storage kontrol et
2. `cart-storage` key'ini kontrol et
3. Store'u temizlemek için: `localStorage.removeItem('cart-storage')`

---

## Kaynaklar

- [Zustand Dokümantasyonu](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Middleware](https://github.com/pmndrs/zustand#middleware)

---

**Son Güncelleme**: 2026-01-13
