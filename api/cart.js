import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

/**
 * Sepeti API'den getirir (Client-side)
 * @returns {Promise<Object|null>} Sepet verisi veya null
 */
export async function getCart() {
    try {
        const response = await apiClient.get("/cart", {
            validateStatus: (status) => status === 200 || status === 404,
        });

        // Response geldiğinde hangi component'ten geldiğini göster
        const stackTrace = new Error().stack;
        log(`[getCart] ✅ Response geldi - Status: ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            stackTrace: stackTrace
        });

        if (response.status === 404) {
            return null;
        }
        if (response?.data?.status === "success" && response.data.data) {
            const cartData = response.data.data;

            // Debug: Kupon bilgisini logla
            log("[API cart.js] getCart - Coupon bilgisi:", cartData.coupon);

            // Sadece gerekli verileri normalize et
            const normalizedCart = {
                // Cart bilgileri
                cartId: cartData.cart?.id || null,
                deviceId: cartData.cart?.device_id || null,

                // Items - sadece gerekli alanlar
                items: (cartData.items || []).map(item => {
                    // cover_image objesi veya null olabilir
                    const coverImage = item.product?.cover_image;
                    const imageUrl = coverImage?.url || coverImage || null;

                    return {
                        id: item.id, // API item ID'si
                        productId: item.product?.id || item.product_id,
                        quantity: item.quantity || 1,
                        unitPrice: parseFloat(item.unit_price || 0),
                        discountAmount: parseFloat(item.discount_amount || 0),
                        taxAmount: parseFloat(item.tax_amount || 0),
                        total: parseFloat(item.total || 0),
                        is_gift: item.is_gift || false,
                        source_product_ids: item.source_product_ids || [],
                        applied_campaign_ids: item.applied_campaign_ids || [],
                        // Product bilgileri (minimal)
                        product: {
                            id: item.product?.id || item.product_id,
                            name: item.product?.name || "",
                            slug: item.product?.slug || "",
                            sku: item.product?.sku || "",
                            coverImage: imageUrl,
                            maxPurchaseQuantity:
                                item.product?.max_purchase_quantity ??
                                item.product?.max_quantity ??
                                null,
                        }
                    };
                }),

                // Totals
                totals: {
                    subtotal: parseFloat(cartData.totals?.subtotal || 0),
                    custom_discount_amount: parseFloat(cartData.totals?.custom_discount_amount || 0),
                    coupon_discount_amount: parseFloat(cartData.totals?.coupon_discount_amount || 0),
                    campaign_discount_amount: parseFloat(cartData.totals?.campaign_discount_amount || 0),
                    discountAmount: parseFloat(cartData.totals?.discount_amount || 0),
                    taxAmount: parseFloat(cartData.totals?.tax_amount || 0),
                    total: parseFloat(cartData.totals?.total || 0),
                    totalItems: parseInt(cartData.totals?.total_items || 0),
                },

                // Coupon bilgisi
                coupon: cartData.coupon || null,

                // Applied campaigns
                applied_campaigns: cartData.applied_campaigns || [],
            };

            return normalizedCart;
        }

        log("[API cart.js] getCart failed:", response?.data);
        return null;
    } catch (error) {
        // Axios error response detaylarını logla
        if (error.response) {
            // Server'dan response geldi (400, 500, vb.)
            const stackTrace = new Error().stack;
            console.error(`[getCart] ❌ Error Response geldi - Status: ${error.response.status}`, {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
                stackTrace: stackTrace
            });
            log("[API cart.js] getCart error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
        } else if (error.request) {
            // Request gönderildi ama response gelmedi
            log("[API cart.js] getCart no response:", error.request);
            console.error("[API cart.js] Request error:", error);
        } else {
            // Request hazırlanırken hata
            log("[API cart.js] getCart setup error:", error.message);
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}

/**
 * Sepete ürün ekler (Client-side)
 * @param {string} productSlug - Ürün slug'ı (örn: "katya-u")
 * @param {number} quantity - Miktar (varsayılan: 1)
 * @returns {Promise<Object|null>} Sepet verisi veya null
 */
export async function addToCart(productSlug, quantity = 1) {
    if (!productSlug) {
        log("[API cart.js] addToCart: productSlug is required");
        return null;
    }

    try {
        const response = await apiClient.post("/cart/items", null, {
            params: {
                product_slug: productSlug,
                quantity: quantity,
            }
        });

        // addToCart API'si sadece success mesajı döndürüyor, cart data'sı yok
        // Bu yüzden başarılı olduğunda cart'ı tekrar çekiyoruz
        if (response?.data?.status === "success") {
            // Sepeti tekrar çek (güncel haliyle)
            const updatedCart = await getCart();
            return updatedCart;
        }

        log("[API cart.js] addToCart failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] addToCart error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
            console.error("[API cart.js] Full error:", error);
        } else if (error.request) {
            log("[API cart.js] addToCart no response:", error.request);
            console.error("[API cart.js] Request error:", error);
        } else {
            log("[API cart.js] addToCart setup error:", error.message);
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}

/**
 * Sepetten ürün miktarını azaltır (Client-side)
 * @param {string} productSlug - Ürün slug'ı (örn: "katya-u")
 * @param {number} quantity - Azaltılacak miktar (varsayılan: 1)
 * @returns {Promise<Object|null>} Güncel sepet verisi veya null
 */
export async function decreaseCartQuantity(productSlug, quantity = 1) {
    if (!productSlug) {
        log("[API cart.js] decreaseCartQuantity: productSlug is required");
        return null;
    }

    try {
        const response = await apiClient.post("/cart-minus/items", null, {
            params: {
                product_slug: productSlug,
                quantity: quantity,
            }
        });

        // decreaseCartQuantity API'si sadece success mesajı ve quantity döndürüyor
        // quantity değeri önemsiz, gerçek veriyi /cart API'sinden alıyoruz
        if (response?.data?.status === "success") {
            // Sepeti tekrar çek (güncel haliyle)
            const updatedCart = await getCart();
            return updatedCart;
        }

        log("[API cart.js] decreaseCartQuantity failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] decreaseCartQuantity error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
            console.error("[API cart.js] Full error:", error);
        } else if (error.request) {
            log("[API cart.js] decreaseCartQuantity no response:", error.request);
            console.error("[API cart.js] Request error:", error);
        } else {
            log("[API cart.js] decreaseCartQuantity setup error:", error.message);
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}

/**
 * Sepetten ürün kaldırır (Client-side)
 * @param {string} productSlug - Ürün slug'ı (örn: "katya-u")
 * @returns {Promise<Object|null>} Güncel sepet verisi veya null
 */
export async function removeFromCart(productSlug) {
    if (!productSlug) {
        log("[API cart.js] removeFromCart: productSlug is required");
        return null;
    }

    try {
        const response = await apiClient.delete("/cart/items", {
            params: {
                product_slug: productSlug,
            }
        });

        // removeFromCart API'si sadece success mesajı döndürüyor, cart data'sı yok
        // Bu yüzden başarılı olduğunda cart'ı tekrar çekiyoruz
        if (response?.data?.status === "success") {
            // Sepeti tekrar çek (güncel haliyle)
            const updatedCart = await getCart();
            return updatedCart;
        }

        log("[API cart.js] removeFromCart failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] removeFromCart error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
            console.error("[API cart.js] Full error:", error);
        } else if (error.request) {
            log("[API cart.js] removeFromCart no response:", error.request);
            console.error("[API cart.js] Request error:", error);
        } else {
            log("[API cart.js] removeFromCart setup error:", error.message);
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}

/**
 * Sepet önerilerini API'den getirir (Client-side)
 * Sepette ürün yoksa gösterilecek önerileri döndürür
 * @returns {Promise<Array|null>} Önerilen ürünler listesi veya null
 */
export async function getCartRecommendations() {
    try {
        const response = await apiClient.get("/cart-recommendation", {
            validateStatus: (status) => status === 200 || status === 404,
        });

        if (response.status === 404) {
            return [];
        }
        if (response?.data?.status === "success" && Array.isArray(response.data.data)) {
            // Sadece gerekli alanları normalize et
            const recommendations = response.data.data.map(product => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: parseFloat(product.price || 0),
                discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
                final_price: parseFloat(product.final_price || product.price || 0),
                cover_image: {
                    url: product.cover_image?.url || null,
                    thumbnail_url: product.cover_image?.thumbnail_url || null,
                },
            }));

            log("[API cart.js] getCartRecommendations success:", recommendations.length, "ürün");
            return recommendations;
        }

        log("[API cart.js] getCartRecommendations failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] getCartRecommendations error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
            console.error("[API cart.js] Full error:", error);
        } else if (error.request) {
            log("[API cart.js] getCartRecommendations no response:", error.request);
            console.error("[API cart.js] Request error:", error);
        } else {
            log("[API cart.js] getCartRecommendations setup error:", error.message);
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}

/**
 * Kupon kodunu sepete uygular (Client-side)
 * @param {string} couponCode - Kupon kodu
 * @returns {Promise<Object|null>} Güncel sepet verisi veya null
 */
export async function applyCoupon(couponCode) {
    if (!couponCode) {
        log("[API cart.js] applyCoupon: couponCode is required");
        return null;
    }

    try {
        // Endpoint: /cart/apply-coupon?coupon_code=...
        const requestParams = {
            coupon_code: couponCode,
        };
        
        log("[API cart.js] applyCoupon - İstek gönderiliyor:", {
            endpoint: "/cart/apply-coupon",
            params: requestParams,
            couponCode: couponCode
        });

        const response = await apiClient.post("/cart/apply-coupon", null, {
            params: requestParams
        });

        log("[API cart.js] applyCoupon - Yanıt alındı:", {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
            fullResponse: response
        });

        // API başarılı döndüyse, güncel sepeti çek (1 kez yenile)
        if (response?.data?.status === "success") {
            log("[API cart.js] applyCoupon - Başarılı, sepet yenileniyor...");
            // Sepeti tekrar çek (güncel haliyle)
            const updatedCart = await getCart();
            log("[API cart.js] applyCoupon - Sepet yenilendi:", {
                cartId: updatedCart?.cartId,
                itemsCount: updatedCart?.items?.length,
                totals: updatedCart?.totals
            });
            return updatedCart;
        }

        log("[API cart.js] applyCoupon failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] applyCoupon error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
                fullError: error
            });
            console.error("[API cart.js] Full error:", error);
        } else if (error.request) {
            log("[API cart.js] applyCoupon no response:", {
                request: error.request,
                fullError: error
            });
            console.error("[API cart.js] Request error:", error);
        } else {
            log("[API cart.js] applyCoupon setup error:", {
                message: error.message,
                fullError: error
            });
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}

/**
 * Kupon kodunu sepetten kaldırır (Client-side)
 * @param {string} couponCode - Kaldırılacak kupon kodu
 * @returns {Promise<Object|null>} Güncel sepet verisi veya null
 */
export async function removeCoupon(couponCode) {
    if (!couponCode) {
        log("[API cart.js] removeCoupon: couponCode is required");
        return null;
    }

    try {
        // Endpoint: /cart/remove-coupon?coupon_code=...
        const requestParams = {
            coupon_code: couponCode,
        };
        
        log("[API cart.js] removeCoupon - İstek gönderiliyor:", {
            endpoint: "/cart/remove-coupon",
            params: requestParams,
            couponCode: couponCode
        });

        const response = await apiClient.delete("/cart/remove-coupon", {
            params: requestParams
        });

        log("[API cart.js] removeCoupon - Yanıt alındı:", {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
            fullResponse: response
        });

        // API başarılı döndüyse, güncel sepeti çek (1 kez yenile)
        // Cevap formatı: {"status": "success", "message": "Kupon kaldırıldı", "response_time": 52.75}
        if (response?.data?.status === "success") {
            log("[API cart.js] removeCoupon - Başarılı:", {
                message: response?.data?.message,
                response_time: response?.data?.response_time
            });
            // Sepeti tekrar çek (güncel haliyle)
            const updatedCart = await getCart();
            log("[API cart.js] removeCoupon - Sepet yenilendi:", {
                cartId: updatedCart?.cartId,
                itemsCount: updatedCart?.items?.length,
                totals: updatedCart?.totals,
                coupon: updatedCart?.coupon
            });
            return updatedCart;
        }

        log("[API cart.js] removeCoupon failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] removeCoupon error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
                fullError: error
            });
            console.error("[API cart.js] Full error:", error);
        } else if (error.request) {
            log("[API cart.js] removeCoupon no response:", {
                request: error.request,
                fullError: error
            });
            console.error("[API cart.js] Request error:", error);
        } else {
            log("[API cart.js] removeCoupon setup error:", {
                message: error.message,
                fullError: error
            });
            console.error("[API cart.js] Setup error:", error);
        }
        return null;
    }
}
