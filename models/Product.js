/**
 * @fileoverview Product Model - Ürün veri yapısı ve yardımcı fonksiyonlar
 * @description API'den gelen ve component'lerde kullanılan product objelerinin tip tanımları
 */

/**
 * @typedef {Object} ProductImage
 * @property {string} url - Görsel URL'i
 * @property {string} [thumbnail_url] - Thumbnail URL'i
 * @property {string} [alt_text] - Alternatif metin
 * @property {number} [width] - Görsel genişliği
 * @property {number} [height] - Görsel yüksekliği
 */

/**
 * @typedef {Object} CampaignTag
 * @property {number} [id] - Kampanya etiketi ID'si
 * @property {string} [name] - Kampanya etiketi adı
 * @property {string} [slug] - Kampanya etiketi slug'ı
 * @property {string} [url] - Kampanya etiketi görsel URL'i
 * @property {string} [position] - Kampanya etiketi pozisyonu (left, center, right)
 * @property {string} [text] - Kampanya etiketi metni (eski format)
 * @property {string} [color] - Etiket rengi (eski format)
 * @property {string} [bgColor] - Arka plan rengi (eski format)
 */

/**
 * @typedef {Object} Category
 * @property {number} id - Kategori ID'si
 * @property {string} name - Kategori adı
 * @property {string} slug - Kategori slug'ı
 * @property {boolean} [is_primary] - Birincil kategori mi?
 */

/**
 * @typedef {Object} Review
 * @property {number} id - Yorum ID'si
 * @property {number} rating - Rating (1-5)
 * @property {string} comment - Yorum metni
 * @property {string} [user_name] - Kullanıcı adı
 * @property {string} created_at - Oluşturulma tarihi
 */

/**
 * @typedef {Object} ReviewsData
 * @property {number} count - Toplam yorum sayısı
 * @property {number} average_rating - Ortalama rating
 * @property {Review[]} items - Yorum listesi
 */

/**
 * @typedef {Object} TechnicalSpec
 * @property {string} name - Özellik adı
 * @property {string} value - Özellik değeri
 */

/**
 * @typedef {Object} TechnicalSpecification
 * @property {string} title - Özellik grubu başlığı
 * @property {TechnicalSpec[]} specs - Özellik listesi
 */

/**
 * @typedef {Object} BoxContentItem
 * @property {number|null} image_id - Görsel ID'si
 * @property {string} name - İçerik adı
 * @property {number} quantity - Miktar
 * @property {string|null} purchase_link - Satın alma linki
 */

/**
 * @typedef {Object} SEOData
 * @property {string|null} title - SEO başlığı
 * @property {string|null} description - SEO açıklaması
 * @property {string|null} keywords - SEO anahtar kelimeleri
 * @property {boolean} no_index - Indexlenmesin mi?
 * @property {boolean} no_follow - Follow edilmesin mi?
 */

/**
 * @typedef {Object} TimeBasedDiscount
 * @property {string} start_date - Başlangıç tarihi
 * @property {string} end_date - Bitiş tarihi
 * @property {number} discount_percentage - İndirim yüzdesi
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Ürün benzersiz ID'si (zorunlu)
 * @property {string} [name] - Ürün adı (API'den gelebilir)
 * @property {string} [title] - Ürün başlığı (eski sistem uyumluluğu için)
 * @property {string} [slug] - Ürün slug'ı
 * @property {string} [sku] - Ürün SKU kodu
 * @property {string|null} [barcode] - Barkod
 * @property {string|null} [gtip_no] - GTIP numarası
 * @property {string} [product_type] - Ürün tipi (single, bundle, vb.)
 * @property {string} [short_description] - Kısa açıklama (HTML)
 * @property {string} [description] - Uzun açıklama (HTML)
 * @property {number} price - Ürün fiyatı (zorunlu)
 * @property {number} [discount_price] - İndirimli fiyat (varsa)
 * @property {number} [tax_rate] - Vergi oranı
 * @property {boolean} [stock_tracking_enabled] - Stok takibi aktif mi?
 * @property {boolean} [unlimited_stock] - Sınırsız stok mu?
 * @property {number} [stock_quantity] - Stok miktarı
 * @property {number} [min_purchase_quantity] - Minimum satın alma miktarı
 * @property {number} [max_purchase_quantity] - Maksimum satın alma miktarı
 * @property {number|null} [width] - Genişlik
 * @property {number|null} [height] - Yükseklik
 * @property {number|null} [length] - Uzunluk
 * @property {number|null} [weight] - Ağırlık
 * @property {boolean} [installment_enabled] - Taksit aktif mi?
 * @property {boolean} [parapuan_enabled] - Parapuan aktif mi?
 * @property {number|null} [parapuan_rate] - Parapuan oranı
 * @property {ProductImage} [cover_image] - Kapak görseli
 * @property {ProductImage[]} [gallery_images] - Galeri görselleri
 * @property {ProductImage} [merchant_image] - Satıcı görseli
 * @property {string|null} [video_url] - Video URL'i
 * @property {string|null} [model_3d_url] - 3D model URL'i
 * @property {ProductImage[]|string[]} [images] - Ürün görselleri array'i (normalize edilmiş)
 * @property {string} [imgSrc] - Tek görsel (eski sistem uyumluluğu için)
 * @property {string} [imgHoverSrc] - Hover görseli (eski sistem uyumluluğu için)
 * @property {Category[]} [categories] - Kategoriler
 * @property {Category} [primary_category] - Birincil kategori
 * @property {CampaignTag[]} [campaign_tags] - Kampanya etiketleri
 * @property {TimeBasedDiscount[]} [time_based_discounts] - Zaman bazlı indirimler
 * @property {Object|null} [bundle_items] - Bundle ürünleri
 * @property {TechnicalSpecification[]} [technical_specifications] - Teknik özellikler
 * @property {BoxContentItem[]} [box_content_data] - Kutu içeriği
 * @property {Object[]} [faq_data] - FAQ verileri
 * @property {boolean} [is_pre_order] - Ön sipariş mi?
 * @property {string|null} [pre_order_start_date] - Ön sipariş başlangıç tarihi
 * @property {string|null} [pre_order_end_date] - Ön sipariş bitiş tarihi
 * @property {string|null} [estimated_shipping_start_date] - Tahmini kargo başlangıç tarihi
 * @property {string|null} [estimated_shipping_end_date] - Tahmini kargo bitiş tarihi
 * @property {string} [pre_order_description] - Ön sipariş açıklaması
 * @property {number} [pre_order_max_quantity] - Ön sipariş maksimum miktar
 * @property {ReviewsData} [reviews] - Değerlendirmeler
 * @property {number} [rating] - Ürün rating'i (0-5 arası) - reviews.average_rating'den normalize edilmiş
 * @property {number} [average_rating] - Ortalama rating (alternatif isim)
 * @property {number} [reviews_count] - Yorum sayısı - reviews.count'dan normalize edilmiş
 * @property {number} [review_count] - Yorum sayısı (alternatif isim)
 * @property {SEOData} [seo] - SEO bilgileri
 * @property {boolean} [is_in_stock] - Stokta var mı? (normalize edilmiş)
 * @property {boolean} [isAvailable] - Mevcut mu? (eski sistem)
 * @property {boolean} [soldOut] - Tükendi mi?
 * @property {number} [quantity] - Sepetteki miktar
 * @property {Object} [countdown] - Geri sayım objesi
 * @property {string[]} [filterCategories] - Filtre kategorileri
 * @property {string[]} [colors] - Ürün renkleri
 * @property {string[]} [sizes] - Ürün bedenleri
 * @property {string} [brand] - Marka adı
 * @property {string} [created_at] - Oluşturulma tarihi
 * @property {string} [updated_at] - Güncellenme tarihi
 */

/**
 * Product model için yardımcı fonksiyonlar
 */
export class ProductModel {
    /**
     * Product objesini normalize eder (eski ve yeni formatları birleştirir)
     * API'den gelen detaylı veri yapısını normalize eder
     * @param {Product} product - Ham product objesi
     * @returns {Product} Normalize edilmiş product objesi
     */
    static normalize(product) {
        if (!product || !product.id) {
            throw new Error("Product must have an id");
        }

        // Görselleri normalize et (gallery_images kullan, cover zaten gallery'nin 1. item'ı)
        const normalizeImages = () => {
            // gallery_images varsa direkt kullan (cover_image zaten içinde)
            if (product.gallery_images && product.gallery_images.length > 0) {
                return product.gallery_images;
            }
            // Eğer gallery_images yoksa cover_image'ı kullan
            if (product.cover_image) {
                return [product.cover_image];
            }
            // Eski format desteği
            if (product.images && Array.isArray(product.images)) {
                return product.images;
            }
            if (product.imgSrc) {
                return [product.imgSrc];
            }
            return [];
        };

        const normalizedImages = normalizeImages();
        const firstImage = normalizedImages[0];
        const imgSrc = typeof firstImage === 'string'
            ? firstImage
            : (firstImage?.url || firstImage?.thumbnail_url || "");

        // Reviews'den rating ve count bilgilerini al
        const reviews = product.reviews || {};
        const rating = product.rating || product.average_rating || reviews.average_rating || 0;
        const reviewsCount = product.reviews_count || product.review_count || reviews.count || 0;

        // Stok durumunu hesapla
        const stockTrackingEnabled = product.stock_tracking_enabled !== false;
        const unlimitedStock = product.unlimited_stock || false;
        const stockQuantity = product.stock_quantity || 0;
        const isInStock = stockTrackingEnabled
            ? (unlimitedStock || stockQuantity > 0)
            : (product.is_in_stock ?? product.isAvailable ?? true);

        // Kategorileri normalize et
        const categories = product.categories || [];
        const primaryCategory = product.primary_category || categories.find(cat => cat.is_primary) || categories[0] || null;

        return {
            // Temel bilgiler
            id: product.id,
            name: product.name || product.title || "",
            title: product.title || product.name || "",
            slug: product.slug || product.id.toString(),
            sku: product.sku || "",
            barcode: product.barcode || null,
            gtip_no: product.gtip_no || null,
            product_type: product.product_type || "single",

            // Açıklamalar
            short_description: product.short_description || "",
            description: product.description || "",

            // Fiyat bilgileri
            price: product.price || 0,
            discount_price: product.discount_price || null,
            tax_rate: product.tax_rate || 0,

            // Stok bilgileri
            stock_tracking_enabled: stockTrackingEnabled,
            unlimited_stock: unlimitedStock,
            stock_quantity: stockQuantity,
            is_in_stock: isInStock,
            isAvailable: isInStock,
            soldOut: !isInStock && !product.is_pre_order,

            // Sipariş miktarları
            min_purchase_quantity: product.min_purchase_quantity || 1,
            max_purchase_quantity: product.max_purchase_quantity || null,

            // Boyut ve ağırlık
            width: product.width || null,
            height: product.height || null,
            length: product.length || null,
            weight: product.weight || null,

            // Ödeme seçenekleri
            installment_enabled: product.installment_enabled || false,
            parapuan_enabled: product.parapuan_enabled || false,
            parapuan_rate: product.parapuan_rate || null,

            // Görseller
            cover_image: product.cover_image || null,
            gallery_images: product.gallery_images || [],
            merchant_image: product.merchant_image || null,
            images: normalizedImages,
            imgSrc: imgSrc,
            imgHoverSrc: product.imgHoverSrc || (normalizedImages[1]?.url || normalizedImages[1] || null),

            // Medya
            video_url: product.video_url || null,
            model_3d_url: product.model_3d_url || null,

            // Kategoriler
            categories: categories,
            primary_category: primaryCategory,

            // Kampanya etiketleri
            campaign_tags: product.campaign_tags || [],

            // İndirimler
            time_based_discounts: product.time_based_discounts || [],

            // Varyasyonlar
            variations: product.variations || [],

            // Bundle
            bundle_items: product.bundle_items || null,
            bundle_total_prices: product.bundle_total_prices || null,

            // Açıklama layout: "standard" = container, "full" = container-fluid
            description_layout: product.description_layout || "standard",

            // Teknik özellikler ve içerik
            technical_specifications: product.technical_specifications || [],
            box_content_data: product.box_content_data || [],
            faq_data: product.faq_data || [],

            // Ön sipariş
            is_pre_order: product.is_pre_order || false,
            pre_order_start_date: product.pre_order_start_date || null,
            pre_order_end_date: product.pre_order_end_date || null,
            estimated_shipping_start_date: product.estimated_shipping_start_date || null,
            estimated_shipping_end_date: product.estimated_shipping_end_date || null,
            pre_order_description: product.pre_order_description || "",
            pre_order_max_quantity: product.pre_order_max_quantity || null,

            // Değerlendirmeler
            reviews: reviews,
            rating: rating,
            average_rating: rating,
            reviews_count: reviewsCount,
            review_count: reviewsCount,

            // SEO
            seo: product.seo || {
                title: null,
                description: null,
                keywords: null,
                no_index: false,
                no_follow: false,
            },

            // Eski sistem uyumluluğu
            colors: product.colors || [],
            sizes: product.sizes || [],
            brand: product.brand || "",
            quantity: product.quantity || 1,
            countdown: product.countdown || null,
            filterCategories: product.filterCategories || categories.map(cat => cat.name || cat.slug),

            // Tarihler
            created_at: product.created_at || null,
            updated_at: product.updated_at || null,

            // Info mesajları
            info_messages: product.info_messages || [],

            // Hediye kampanyaları (sepete eklerken hediye seçimi için)
            selectable_gift_campaigns: product.selectable_gift_campaigns || product.selectableGiftCampaigns || [],

            // Ürün protokolü (Wi-Fi, Zigbee vb. – görsel + açıklama)
            product_protocol: product.product_protocol || null,
        };
    }

    /**
     * Ürünün final fiyatını hesaplar (indirimli fiyat varsa onu, yoksa normal fiyatı döner)
     * @param {Product} product - Product objesi
     * @returns {number} Final fiyat
     */
    static getFinalPrice(product) {
        return product.discount_price || product.price || 0;
    }

    /**
     * Ürünün eski fiyatını döner (indirim varsa)
     * @param {Product} product - Product objesi
     * @returns {number|null} Eski fiyat veya null
     */
    static getOldPrice(product) {
        return product.discount_price ? product.price : null;
    }

    /**
     * Ürünün indirim yüzdesini hesaplar
     * @param {Product} product - Product objesi
     * @returns {number} İndirim yüzdesi (0-100 arası)
     */
    static getDiscountPercentage(product) {
        if (!product.discount_price || !product.price) return 0;
        return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }

    /**
     * Ürünün stok durumunu kontrol eder
     * @param {Product} product - Product objesi
     * @returns {Object} Stok durumu bilgileri
     */
    static getStockStatus(product) {
        const isInStock = product.is_in_stock ?? product.isAvailable ?? true;
        const unlimitedStock = product.unlimited_stock || false;
        const isPreOrder = product.is_pre_order || false;
        const stockQuantity = product.stock_quantity || 0;

        return {
            isInStock,
            unlimitedStock,
            isPreOrder,
            stockQuantity,
            canAddToCart: isInStock || isPreOrder,
        };
    }

    /**
     * Ürünün buton metnini döner (stok durumuna göre)
     * @param {Product} product - Product objesi
     * @returns {Object} Buton metni ve disabled durumu
     */
    static getButtonText(product) {
        const stockStatus = this.getStockStatus(product);
        let text = "Sepete Ekle";
        let disabled = false;

        if (stockStatus.isInStock) {
            if (stockStatus.unlimitedStock) {
                text = "Sepete Ekle";
            } else {
                text = `Son ${stockStatus.stockQuantity} ürün`;
            }
        } else {
            if (stockStatus.isPreOrder) {
                text = "Ön Sipariş Ver";
            } else {
                text = "Stokta Yok";
                disabled = true;
            }
        }

        return { text, disabled };
    }

    /**
     * Ürünün rating bilgisini normalize eder
     * @param {Product} product - Product objesi
     * @returns {Object} Rating bilgileri
     */
    static getRating(product) {
        return {
            value: product.rating || product.average_rating || 0,
            count: product.reviews_count || product.review_count || 0,
            hasRating: (product.rating || product.average_rating || 0) > 0,
        };
    }

    /**
     * Ürünün görsellerini normalize eder
     * @param {Product} product - Product objesi
     * @returns {Array} Normalize edilmiş görsel array'i
     */
    static getImages(product) {
        if (product.images && Array.isArray(product.images)) {
            return product.images;
        }
        if (product.imgSrc) {
            return [product.imgSrc];
        }
        return [];
    }

    /**
     * Ürünün slug'ını normalize eder
     * @param {Product} product - Product objesi
     * @returns {string|number} Slug değeri
     */
    static getSlug(product) {
        return product.slug || product.id;
    }

    /**
     * Ürünün başlığını normalize eder
     * @param {Product} product - Product objesi
     * @returns {string} Ürün başlığı
     */
    static getTitle(product) {
        return product.name || product.title || "";
    }
}

/**
 * Product tip kontrolü için type guard
 * @param {any} obj - Kontrol edilecek obje
 * @returns {boolean} Product objesi mi?
 */
export function isProduct(obj) {
    return obj && typeof obj === "object" && typeof obj.id !== "undefined";
}

/**
 * Product array tip kontrolü
 * @param {any} arr - Kontrol edilecek array
 * @returns {boolean} Product array'i mi?
 */
export function isProductArray(arr) {
    return Array.isArray(arr) && arr.every(isProduct);
}

// Default export
export default ProductModel;

