# Robot Öneri Algoritması (Algorithm Guide)

Bu doküman, kullanıcı seçimlerine (Alan, Pet, Halı, İstasyon) göre en uygun robot modelini belirleyen `page.jsx` içindeki `recommendedRobot` mantığını açıklar.

## 🧠 Karakter Karar Ağacı

Algoritma, seçimleri belirli bir hiyerarşiye göre değerlendirir:

### 1. İstasyon Tercihi (En Yüksek Öncelik - Kırmızı Çizgi)
Eğer kullanıcı **"İstasyon Yok"** (`hayir`) seçeneğini işaretlediyse, halısı ne kadar çok olursa olsun veya evi ne kadar büyük olursa olsun **istasyonlu modeller (U ve V+) asla önerilmez.**

### 2. Model Eşleşme Senaryoları

| Senaryo No | İstasyon Tercihi | Halı Yoğunluğu | Evcil Hayvan | Ev Büyüklüğü | Önerilen Model | Neden? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Yok (`hayir`) | Az / Orta | Yok | <= 165m² | **Katya Z** | Fiyat/performans ve geniş alan dengesi. |
| **2** | Yok (`hayir`) | Az / Orta | Var | <= 165m² | **Katya P** | Pet sahipleri için optimize edilmiş vakum gücü. |
| **3** | Yok (`hayir`) | Çok (`Çok`) | Herhangi | Herhangi | **Katya V** | Halı yoğunluğuna en dayanıklı istasyonsuz model. |
| **4** | Toz Boşaltma (`toz`) | Herhangi | Herhangi | Herhangi | **Katya V+** | Standart toz boşaltma konforu için ideal. |
| **5** | Hepsi (`hepsi`) | Herhangi | Herhangi | Herhangi | **Katya U** | Mop kaldırma, su yenileme ve tam otomasyon zirvesi. |
| **6** | Herhangi (Toz/Hepsi) | Çok (`Çok`) | Herhangi | Herhangi | **Katya U** | Halı çoksa paspas kaldırma (Mop Lifting) şarttır. |

## 🛠️ Teknik mapping (ID'ler)

Algoritma, `robots.jsx` dosyasındaki şu ID'lerle eşleşir:

- **Katya V (Default):** `katya-v-akilli-robot-supurge`
- **Katya V+:** `katya-v-plus-akilli-robot-supurge`
- **Katya P:** `katya-p-akilli-robot-supurge`
- **Katya Z:** `katya-z-akilli-robot-supurge`
- **Katya U:** `katya-u-akilli-robot-supurge`

## ⏳ Analiz Süreci
Seçimler bittikten sonra 1.5 saniyelik bir analiz animasyonu (`isAnalyzing`) döner. Bu sürede `analysisMessages` dizisindeki seçimler ekranda sırayla görünerek kullanıcıya kişiselleştirilmiş bir deneyim sunulur.
