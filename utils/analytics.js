/**
 * Google Tag Manager / GA4 gtag() Fonksiyonu
 */

/**
 * gtag fonksiyonuna veri gönderir.
 * @param {string} command 
 * @param {string} eventName 
 * @param {Object} eventParameters 
 */
export const gtag = (...args) => {
    if (typeof window !== 'undefined') {
        // gtag tanımlı değilse dataLayer üzerinden çalışması için window.gtag'ı kontrol et
        if (typeof window.gtag === 'function') {
            window.gtag(...args);
            console.log(`[Analytics] gtag call:`, args);
        } else {
            // Fallback: window.gtag yoksa doğrudan dataLayer'a pushla (GTM standaradı)
            window.dataLayer = window.dataLayer || [];
            if (args[0] === 'event') {
                const eventName = args[1];
                const params = args[2] || {};
                window.dataLayer.push({
                    event: eventName,
                    ...params
                });
                console.log(`[Analytics] gtag fallback (dataLayer push): ${eventName}`, params);
            } else {
                window.dataLayer.push(args);
                console.log(`[Analytics] gtag fallback (dataLayer push arguments):`, args);
            }
        }
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
    gtag('event', 'add_to_cart', {
        currency: 'TRY',
        value: item.price * item.quantity,
        items: [item],
    });
};

/**
 * Ödeme Başlatma (begin_checkout)
 */
export const trackBeginCheckout = (items, totals) => {
    const normalizedItems = items.map(item => normalizeItem(item));
    gtag('event', 'begin_checkout', {
        currency: 'TRY',
        value: Number(totals?.total || totals?.grand_total || 0),
        items: normalizedItems,
    });
};

/**
 * Satın Alma (purchase)
 */
export const trackPurchase = (orderData) => {
    if (!orderData) return;

    const normalizedItems = (orderData.items || []).map(item => normalizeItem(item));

    gtag('event', 'purchase', {
        transaction_id: String(orderData.id || orderData.order_number || orderData.order_id),
        value: Number(orderData.total || orderData.grand_total || 0),
        tax: Number(orderData.tax_total || 0),
        shipping: Number(orderData.shipping_total || 0),
        currency: 'TRY',
        coupon: orderData.coupon || undefined,
        items: normalizedItems,
    });
};
