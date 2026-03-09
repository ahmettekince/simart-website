import { log } from "./logger";

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
 * Meta Pixel (Facebook) Etkinliği Gönderir
 */
export const trackMetaEvent = (eventName, params = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        try {
            window.fbq('track', eventName, params);
            log(`[Analytics] Meta Pixel: ${eventName}`, params);
        } catch (err) {
            console.error(`[Analytics] Meta Pixel Error on ${eventName}:`, err);
        }
    }
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
            log(`[Analytics] Duplicate event blocked for ${eventName}: ${transactionId}`);
            return;
        }

        window.dataLayer = window.dataLayer || [];

        try {
            // GA4 Standartı: Önceki ecommerce verilerini temizle
            // Bazı GTM tagleri 'null' değerini sevmediği için boş obje ile temizlemeyi deneyelim
            window.dataLayer.push({ ecommerce: null });

            // Yeni veriyi gönder
            const pushData = {
                event: eventName,
                ecommerce: {
                    ...ecommerceData,
                    productPage: window.location.pathname
                }
            };

            window.dataLayer.push(pushData);
            log(`[Analytics] dataLayer.push: ${eventName}`, pushData);
        } catch (err) {
            log(`[Analytics] GTM Push Error on ${eventName}:`, err);
        }
    }
};

/**
 * Ürünü GA4 formatına normalize eder.
 */
const normalizeItem = (item, quantity) => {
    if (!item) return {};

    const itemPrice = item.discount_price || item.price || item.unitPrice || 0;
    const categoryNames = [];

    // 1. Kategorileri her türlü delikten topla
    const rawCategories = [
        ...(Array.isArray(item.categories) ? item.categories : []),
        ...(Array.isArray(item.product?.categories) ? item.product.categories : []),
        ...(item.primary_category ? [item.primary_category] : []),
        ...(item.product?.primary_category ? [item.product.primary_category] : []),
        ...(item.primaryCategory ? [item.primaryCategory] : []),
        ...(item.product?.primaryCategory ? [item.product.primaryCategory] : []),
        ...(item.item_category && typeof item.item_category !== 'string' ? [item.item_category] : [])
    ];

    // 2. İsimleri ayıkla ve tekilleştir
    rawCategories.forEach(cat => {
        if (!cat) return;
        let name = null;
        if (typeof cat === 'string') name = cat;
        else name = cat.name || cat.title || cat.slug;

        if (name && !categoryNames.includes(name)) {
            categoryNames.push(name);
        }
    });

    // 3. Eğer dizi hala boşsa düz string alanlara bak
    if (categoryNames.length === 0) {
        const stringFallback =
            item.category_name ||
            (typeof item.item_category === 'string' ? item.item_category : null) ||
            item.category ||
            item.product?.category_name ||
            item.category_slug ||
            item.product?.category_slug;

        if (stringFallback) categoryNames.push(stringFallback);
    }

    const gaItem = {
        item_id: String(item.id || item.productId || item.product?.id || item.apiItemId || item.sku || ''),
        item_name: item.name || item.product?.name || item.title || '',
        price: Number(itemPrice),
        quantity: Number(quantity || item.quantity || 1),
        item_brand: 'Şımart Teknoloji',
    };

    // GA4 Standartı: item_category, item_category2, ... item_category5
    categoryNames.slice(0, 5).forEach((name, index) => {
        const key = index === 0 ? 'item_category' : `item_category${index + 1}`;
        let formattedName = name;

        // Eğer slug gelmişse (örn: "robot-supurgeler") ve içinde - varsa formatla
        if (typeof name === 'string' && name.includes('-') && !name.includes(' ')) {
            formattedName = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        // "urunler" veya "Genel" gibi değersiz verileri temizle
        if (typeof formattedName === 'string') {
            const lower = formattedName.toLowerCase();
            if (lower === 'urunler' || lower === 'products' || lower === 'genel' || lower === 'shop') {
                formattedName = 'Akıllı Ürünler';
            }
        }

        gaItem[key] = formattedName;
    });

    // En son çare: Eğer hala boşsa
    if (!gaItem.item_category) {
        gaItem.item_category = 'Akıllı Ürünler';
    }

    return gaItem;
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

    // GTM
    pushToDataLayer('add_to_cart', {
        currency: 'TRY',
        value: item.price * item.quantity,
        items: [item]
    });

    // Meta Pixel
    // trackMetaEvent('AddToCart', {
    //     content_ids: [item.item_id],
    //     content_type: 'product',
    //     value: item.price * item.quantity,
    //     currency: 'TRY'
    // });
};

/**
 * Ödeme Başlatma (begin_checkout)
 */
export const trackBeginCheckout = (items, totals, couponCode = null) => {
    const normalizedItems = items.map(item => normalizeItem(item));
    const totalValue = Number(totals?.total || totals?.grand_total || 0);

    // GTM
    pushToDataLayer('begin_checkout', {
        currency: 'TRY',
        value: totalValue,
        coupon: couponCode || undefined,
        items: normalizedItems
    });

    // // Meta Pixel
    // trackMetaEvent('InitiateCheckout', {
    //     content_ids: normalizedItems.map(i => i.item_id),
    //     content_type: 'product',
    //     value: totalValue,
    //     currency: 'TRY'
    // });
};

/**
 * Satın Alma (purchase)
 */
export const trackPurchase = (orderData) => {
    if (!orderData) return;

    const normalizedItems = (orderData.items || []).map(item => normalizeItem(item));
    const totalValue = Number(orderData.total || orderData.grand_total || 0);

    // GTM
    pushToDataLayer('purchase', {
        transaction_id: String(orderData.id || orderData.order_number || orderData.order_id),
        value: totalValue,
        tax: Number(orderData.tax_total || 0),
        shipping: Number(orderData.shipping_total || 0),
        currency: 'TRY',
        coupon: orderData.coupon || undefined,
        items: normalizedItems
    });

    // Meta Pixel
    trackMetaEvent('Purchase', {
        value: totalValue,
        currency: 'TRY',
    });
};

/**
 * Ürün Listesi Görüntüleme (view_item_list)
 */
export const trackViewItemList = (products, listName = 'Ürün Listesi', listId = 'product_list') => {
    if (!products || !Array.isArray(products)) return;

    const normalizedItems = products.map((item, index) => ({
        ...normalizeItem(item),
        item_list_id: listId,
        item_list_name: listName,
        index: index + 1
    }));

    pushToDataLayer('view_item_list', {
        item_list_id: listId,
        item_list_name: listName,
        items: normalizedItems
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
