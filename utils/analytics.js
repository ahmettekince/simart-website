/**
 * Google Tag Manager (GTM) E-ticaret Etkinlikleri (GA4 Standardı)
 */

/**
 * Siparişin daha önce işlenip işlenmediğini kontrol eder ve işaretler.
 * Sayfa yenilemelerinde mükerrer event gönderimini engeller.
 */
const isOrderProcessed = (orderId, eventName) => {
    if (!orderId || typeof window === 'undefined') return false;
    const key = `processed_${eventName}_${orderId}`;
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, 'true');
    return false;
};

/**
 * Veri katmanına (dataLayer) olay gönderir.
 * @param {string} eventName 
 * @param {Object} ecommerceData 
 */
export const pushToDataLayer = (eventName, ecommerceData = {}) => {
    if (typeof window !== 'undefined') {
        // Eğer bir transaction_id varsa, mükerrer gönderimi kontrol et
        const transactionId = ecommerceData.transaction_id || (ecommerceData.purchase && ecommerceData.purchase.transaction_id);
        if (transactionId && isOrderProcessed(transactionId, eventName)) {
            console.log(`[Analytics] Duplicate event blocked for ${eventName}: ${transactionId}`);
            return;
        }

        window.dataLayer = window.dataLayer || [];

        // GA4 Standartı: Önceki ecommerce verilerini temizle
        window.dataLayer.push({ ecommerce: null });

        // Yeni veriyi gönder
        const pushData = {
            event: eventName,
            ecommerce: ecommerceData
        };

        window.dataLayer.push(pushData);
        console.log(`[Analytics] dataLayer.push: ${eventName}`, pushData);
    }
};

/**
 * Ürünü GA4 formatına normalize eder.
 */
const normalizeItem = (item, quantity) => {
    const itemPrice = item.discount_price || item.price || 0;

    // Kategori adını belirle (Öncelik: primary_category > categories[0] > fallback)
    const category =
        item.product?.primary_category?.name ||
        item.product?.primaryCategory?.name ||
        (Array.isArray(item.product?.categories) && item.product.categories[0]?.name) ||
        item.category ||
        'Ürün';

    return {
        item_id: String(item.id || item.productId || item.product?.id),
        item_name: item.name || item.product?.name || '',
        price: Number(itemPrice),
        quantity: Number(quantity || item.quantity || 1),
        item_brand: 'Şımart Teknoloji',
        item_category: category
    };
};

/**
 * Ürün Görüntüleme (view_item)
 */
export const trackViewItem = (product) => {
    if (!product) return;
    const item = normalizeItem(product);
    pushToDataLayer('view_item', {
        currency: 'TRY',
        value: item.price,
        items: [item]
    });
};

/**
 * Sepete Ekleme (add_to_cart)
 */
export const trackAddToCart = (product, quantity = 1) => {
    const item = normalizeItem(product, quantity);
    pushToDataLayer('add_to_cart', {
        currency: 'TRY',
        value: item.price * item.quantity,
        items: [item]
    });
};

/**
 * Ödeme Başlatma (begin_checkout)
 */
export const trackBeginCheckout = (items, totals) => {
    const normalizedItems = items.map(item => normalizeItem(item));
    pushToDataLayer('begin_checkout', {
        currency: 'TRY',
        value: Number(totals?.total || totals?.grand_total || 0),
        items: normalizedItems
    });
};

/**
 * Satın Alma (purchase)
 */
export const trackPurchase = (orderData) => {
    if (!orderData) return;

    const normalizedItems = (orderData.items || []).map(item => normalizeItem(item));

    pushToDataLayer('purchase', {
        transaction_id: String(orderData.id || orderData.order_number || orderData.order_id),
        value: Number(orderData.total || orderData.grand_total || 0),
        tax: Number(orderData.tax_total || 0),
        shipping: Number(orderData.shipping_total || 0),
        currency: 'TRY',
        coupon: orderData.coupon || undefined,
        items: normalizedItems
    });
};

/**
 * Satın Alma Başarılı (purchase_success)
 */
export const trackPurchaseSuccess = (orderData) => {
    if (!orderData) return;
    pushToDataLayer('purchase_success', {
        transaction_id: String(orderData.id || orderData.order_number || orderData.order_id),
        value: Number(orderData.total || orderData.grand_total || 0),
        currency: 'TRY'
    });
};

/**
 * Satın Alma Başarısız (purchase_failure)
 */
export const trackPurchaseFailure = (errorMessage, orderId = null) => {
    pushToDataLayer('purchase_failed', {
        error_message: errorMessage,
        transaction_id: orderId ? String(orderId) : undefined,
        currency: 'TRY'
    });
};

// Geriye dönük uyumluluk için gtag fonksiyonu (varsa diğer kısımlar için)
export const gtag = (...args) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag(...args);
    }
};
