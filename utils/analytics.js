/**
 * Google Tag Manager (GTM) E-ticaret Etkinlikleri (GA4 Standardı)
 */

/**
 * Veri katmanına (dataLayer) olay gönderir.
 * @param {string} eventName 
 * @param {Object} ecommerceData 
 */
export const pushToDataLayer = (eventName, ecommerceData = {}) => {
    if (typeof window !== 'undefined') {
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
    return {
        item_id: String(item.id || item.productId || item.product?.id),
        item_name: item.name || item.product?.name || '',
        price: Number(itemPrice),
        quantity: Number(quantity || item.quantity || 1),
        item_brand: 'Simart',
        item_category: item.product?.primary_category?.name || 'Ürünler'
    };
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

// Geriye dönük uyumluluk için gtag fonksiyonu (varsa diğer kısımlar için)
export const gtag = (...args) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag(...args);
    }
};
