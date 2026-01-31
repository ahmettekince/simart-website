/**
 * @fileoverview Cart Store - Zustand ile atomik sepet yönetimi
 * @description E-ticaret sitesi için global sepet state yönetimi
 */

import { create } from 'zustand';
import { openCartModal } from '@/utils/openCartModal';
import { addToCart as addToCartAPI, removeFromCart as removeFromCartAPI, decreaseCartQuantity as decreaseCartQuantityAPI, updateCartQuantity as updateCartQuantityAPI, getCart, applyCoupon as applyCouponAPI, removeCoupon as removeCouponAPI, clearCart as clearCartAPI } from '@/api/cart';
import { log } from '@/utils/logger';

/**
 * @typedef {Object} CartItem
 * @property {number} id - Ürün ID'si
 * @property {string} name - Ürün adı
 * @property {string} slug - Ürün slug'ı
 * @property {number} price - Ürün fiyatı
 * @property {number} [discount_price] - İndirimli fiyat
 * @property {number} quantity - Sepetteki miktar
 * @property {string} [image] - Ürün görseli URL'i
 * @property {Object} [product] - Tam ürün objesi (opsiyonel)
 */

/**
 * Cart Store State Interface
 * @typedef {Object} CartState
 * @property {CartItem[]} items - Sepetteki ürünler
 * @property {number} totalPrice - Toplam fiyat (computed)
 * @property {number} totalItems - Toplam ürün sayısı (computed)
 * @property {(product: Object, quantity?: number) => void} addItem - Sepete ürün ekle
 * @property {(productId: number, quantity: number) => void} updateQuantity - Ürün miktarını güncelle
 * @property {(productId: number) => void} removeItem - Sepetten ürün çıkar
 * @property {(productId: number) => boolean} isInCart - Ürün sepette mi kontrol et
 * @property {() => void} clearCart - Sepeti temizle
 * @property {(productId: number) => CartItem | undefined} getItem - Sepetteki ürünü getir
 */

/**
 * Toplam fiyatı hesaplar
 * @param {CartItem[]} items - Sepetteki ürünler
 * @returns {number} Toplam fiyat
 */
const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => {
        const itemPrice = item.discount_price || item.price || 0;
        return total + (itemPrice * item.quantity);
    }, 0);
};

/**
 * Toplam ürün sayısını hesaplar
 * @param {CartItem[]} items - Sepetteki ürünler
 * @returns {number} Toplam ürün sayısı
 */
const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Cart Store - Zustand ile atomik sepet yönetimi
 * API tabanlı - localStorage kullanılmıyor
 */
export const useCartStore = create(
    (set, get) => ({
        // State
        items: [],
        cartId: null, // API'den gelen cart ID
        deviceId: null, // Device ID
        isSynced: false, // API ile senkronize mi?
        totals: null, // API'den gelen toplam bilgileri (subtotal, discount, tax, total)
        applied_campaigns: [], // Uygulanan kampanyalar
        coupon: null, // Uygulanan kupon bilgisi

        // Actions

        /**
         * Sepete ürün ekle (API ile senkronize)
         * @param {Object} product - Ürün objesi
         * @param {number} quantity - Miktar (varsayılan: 1)
         * @param {boolean} openModal - Modal açılsın mı? (varsayılan: false)
         */
        addItem: async (product, quantity = 1, openModal = false) => {
            if (!product || !product.id) {
                log('[CartStore] addItem: Geçersiz ürün objesi');
                return;
            }

            const productSlug = product.slug || '';
            if (!productSlug) {
                log('[CartStore] addItem: Ürün slug\'ı bulunamadı');
                return;
            }

            try {
                // API'ye istek at
                const cartData = await addToCartAPI(productSlug, quantity);

                // API başarılı döndüyse, güncel sepeti çek ve store'u güncelle
                if (cartData) {
                    const updatedCart = await getCart();
                    if (updatedCart) {
                        get().syncFromAPI(updatedCart);
                        log('[CartStore] addItem - Store updated');

                        // Modal açılması gerekiyorsa
                        if (openModal) {
                            if (typeof window !== 'undefined') {
                                setTimeout(() => {
                                    openCartModal();
                                }, 100);
                            }
                        }
                    }
                } else {
                    log('[CartStore] addItem: API başarısız oldu');
                }
            } catch (error) {
                log('[CartStore] addItem error:', error);
            }
        },

        /**
         * Ürün miktarını güncelle (API ile senkronize)
         * @param {number} productId - Ürün ID'si (store'daki id)
         * @param {number} quantity - Yeni miktar (minimum 1)
         */
        updateQuantity: async (productId, quantity) => {
            if (quantity < 1) {
                log('[CartStore] updateQuantity: Miktar 1\'den küçük olamaz');
                return;
            }

            const state = get();
            const item = state.items.find(item => item.id === productId);

            if (!item) {
                log(`[CartStore] updateQuantity: Ürün bulunamadı (ID: ${productId})`);
                return;
            }

            const rawMax =
                item.max_purchase_quantity ?? item.product?.max_purchase_quantity ?? item.product?.max_quantity ?? null;
            const parsedMax = rawMax === null || rawMax === undefined ? null : Number(rawMax);
            const maxQty =
                parsedMax === 0 ? 999 : (Number.isFinite(parsedMax) ? parsedMax : null);
            if (maxQty && quantity > maxQty) {
                quantity = maxQty;
            }

            // Slug'ı bul
            const slug = item.slug || item.product?.slug;

            if (!slug) {
                log(`[CartStore] updateQuantity: Ürün slug'ı bulunamadı (ID: ${productId})`);
                return;
            }

            try {
                // Direkt quantity güncelleme için PUT metodu kullan
                const result = await updateCartQuantityAPI(slug, quantity);
                if (!result) {
                    log('[CartStore] updateQuantity: updateCartQuantity API başarısız oldu');
                    return;
                }

                // API başarılı olduysa, güncel sepeti çek ve store'u güncelle
                const updatedCart = await getCart();
                if (updatedCart) {
                    get().syncFromAPI(updatedCart);
                    log('[CartStore] updateQuantity - Store updated');
                }
            } catch (error) {
                log('[CartStore] updateQuantity error:', error);
            }
        },

        /**
         * Sepetten ürün çıkar (API ile senkronize)
         * @param {number} productId - Ürün ID'si (store'daki id)
         * @param {string} [productSlug] - Ürün slug'ı (API için, eğer yoksa store'dan alınır)
         */
        removeItem: async (productId, productSlug = null) => {
            const state = get();
            const item = state.items.find(item => item.id === productId);

            if (!item) {
                log(`[CartStore] removeItem: Ürün bulunamadı (ID: ${productId})`);
                return;
            }

            // Slug'ı bul (parametre olarak gelmediyse store'dan al)
            const slug = productSlug || item.slug || item.product?.slug;

            if (!slug) {
                log(`[CartStore] removeItem: Ürün slug'ı bulunamadı (ID: ${productId})`);
                return;
            }

            try {
                // API'ye istek at
                const cartData = await removeFromCartAPI(slug);

                // API başarılı döndüyse, güncel sepeti çek ve store'u güncelle
                if (cartData) {
                    const updatedCart = await getCart();
                    if (updatedCart) {
                        get().syncFromAPI(updatedCart);
                        log('[CartStore] removeItem - Store updated');
                    }
                } else {
                    log('[CartStore] removeItem: API başarısız oldu');
                }
            } catch (error) {
                log('[CartStore] removeItem error:', error);
            }
        },

        /**
         * Ürünün sepette olup olmadığını kontrol et
         * @param {number} productId - Ürün ID'si
         * @returns {boolean} Sepette var mı?
         */
        isInCart: (productId) => {
            return get().items.some(item => item.id === productId);
        },

        /**
         * Sepetteki ürünü getir
         * @param {number} productId - Ürün ID'si
         * @returns {CartItem | undefined} Sepetteki ürün
         */
        getItem: (productId) => {
            return get().items.find(item => item.id === productId);
        },

        /**
         * Sepeti tamamen temizle (API ile senkronize)
         */
        clearCart: async () => {
            try {
                // API'ye istek at
                const success = await clearCartAPI();
                
                if (success) {
                    set({
                        items: [],
                        cartId: null,
                        deviceId: null,
                        totals: null,
                        applied_campaigns: [],
                        coupon: null,
                        isSynced: true
                    });
                    
                    // Sipariş notunu localStorage'dan da temizle
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('cart_order_note');
                        localStorage.removeItem('cart_gift_note');
                    }
                    
                    log('[CartStore] clearCart - Store cleared and synced with API');
                    return true;
                }
                
                log('[CartStore] clearCart - API failed');
                return false;
            } catch (error) {
                log('[CartStore] clearCart error:', error);
                return false;
            }
        },

        /**
         * API'den gelen sepet verisini store'a senkronize et
         * @param {Object} apiCartData - API'den gelen normalize edilmiş sepet verisi
         */
        syncFromAPI: (apiCartData) => {
            if (!apiCartData || !apiCartData.items) {
                console.warn('[CartStore] syncFromAPI: Geçersiz sepet verisi');
                return;
            }

            // Debug: Kupon bilgisini logla
            log('[CartStore] syncFromAPI - Coupon bilgisi:', apiCartData.coupon);

            // API'den gelen items'ı store formatına çevir
            const storeItems = apiCartData.items.map(apiItem => {
                // coverImage direkt URL string veya null olabilir
                const imageUrl = apiItem.product.coverImage || '';

                return {
                    id: apiItem.productId, // Store'da product.id kullanıyoruz (UI için)
                    productId: apiItem.productId,
                    apiItemId: apiItem.id, // API'deki item ID'si (güncelleme/silme için)
                    name: apiItem.product.name || '',
                    slug: apiItem.product.slug || '',
                    price: apiItem.unitPrice, // Normal fiyat
                    discount_price: apiItem.discountAmount > 0 ? apiItem.discountAmount : null, // İndirimli fiyat (eğer varsa)
                    quantity: apiItem.quantity,
                    image: imageUrl,
                    is_gift: apiItem.is_gift || false,
                    source_product_ids: apiItem.source_product_ids || [],
                    applied_campaign_ids: apiItem.applied_campaign_ids || [],
                    max_purchase_quantity: apiItem.product.maxPurchaseQuantity ?? null,
                    // API'den gelen ek bilgiler
                    taxAmount: apiItem.taxAmount,
                    total: apiItem.total,
                    // Product objesi (minimal)
                    product: {
                        id: apiItem.product.id,
                        name: apiItem.product.name,
                        slug: apiItem.product.slug,
                        sku: apiItem.product.sku,
                        cover_image: apiItem.product.coverImage,
                        max_purchase_quantity: apiItem.product.maxPurchaseQuantity ?? null,
                    }
                };
            });

            set({
                items: storeItems,
                cartId: apiCartData.cartId,
                deviceId: apiCartData.deviceId,
                totals: apiCartData.totals || null,
                applied_campaigns: apiCartData.applied_campaigns || [],
                coupon: apiCartData.coupon || null,
                isSynced: true,
            });
        },

        /**
         * Kupon kodunu sepete uygula (API ile senkronize)
         * @param {string} couponCode - Kupon kodu
         * @returns {Promise<boolean>} Başarılı mı?
         */
        applyCoupon: async (couponCode) => {
            if (!couponCode || !couponCode.trim()) {
                log('[CartStore] applyCoupon: Geçersiz kupon kodu');
                return false;
            }

            try {
                // API'ye istek at
                const cartData = await applyCouponAPI(couponCode.trim());

                // API başarılı döndüyse, güncel sepeti çek ve store'u güncelle
                if (cartData) {
                    get().syncFromAPI(cartData);
                    log('[CartStore] applyCoupon - Store updated');
                    return true;
                } else {
                    log('[CartStore] applyCoupon: API başarısız oldu');
                    return false;
                }
            } catch (error) {
                log('[CartStore] applyCoupon error:', error);
                return false;
            }
        },

        /**
         * Kupon kodunu sepetten kaldır (API ile senkronize)
         * @param {string} couponCode - Kaldırılacak kupon kodu
         * @returns {Promise<boolean>} Başarılı mı?
         */
        removeCoupon: async (couponCode) => {
            if (!couponCode || !couponCode.trim()) {
                log('[CartStore] removeCoupon: Geçersiz kupon kodu');
                return false;
            }

            try {
                // API'ye istek at
                const cartData = await removeCouponAPI(couponCode.trim());

                // API başarılı döndüyse, güncel sepeti çek ve store'u güncelle
                if (cartData) {
                    get().syncFromAPI(cartData);
                    log('[CartStore] removeCoupon - Store updated');
                    return true;
                } else {
                    log('[CartStore] removeCoupon: API başarısız oldu');
                    return false;
                }
            } catch (error) {
                log('[CartStore] removeCoupon error:', error);
                return false;
            }
        },
    })
);
