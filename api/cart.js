import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

/**
 * Sepeti API'den getirir (Client-side)
 * @returns {Promise<Object|null>} Sepet verisi veya null
 */
export async function getCart() {
    try {
        const response = await apiClient.get("/cart", {
            validateStatus: (status) => status === 200 || status === 404


        });
        log("[API cart.js] getCart failed:", response.data);


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
                        unitPrice: parseFloat(item.unit_price || item.unit_final || 0),
                        price: item.price ?? item.product?.price ?? null,
                        discount_price: item.discount_price ?? item.product?.discount_price ?? null,
                        discountAmount: item.discount_amount != null ? parseFloat(item.discount_amount) : null,
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
                            minPurchaseQuantity: item.product?.min_purchase_quantity ?? 1,
                            maxPurchaseQuantity:
                                item.product?.max_purchase_quantity ??
                                item.product?.max_quantity ??
                                null,
                            price: item.product?.price ?? item.price ?? null,
                            discount_price: item.product?.discount_price ?? item.discount_price ?? null,
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
                    cart_tips: cartData.cart_tips || cartData.totals?.cart_tips || [],
                },

                // Coupon bilgisi
                coupon: cartData.coupon || null,

                // Applied campaigns
                applied_campaigns: cartData.applied_campaigns || [],

                // Cross-sale campaigns (sepette gösterilecek target ürünler)
                cross_sale_campaigns: cartData.cross_sale_campaigns || [],
            };

            return normalizedCart;
        }


        log("[API cart.js] getCart failed:", response?.data);
        return null;
    } catch (error) {
        // Axios error response detaylarını logla
        if (error.response) {
            log("[API cart.js] getCart error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
        } else if (error.request) {
            // Request gönderildi ama response gelmedi
            log("[API cart.js] getCart no response:", error.request);
        } else {
            // Request hazırlanırken hata
            log("[API cart.js] getCart setup error:", error.message);
        }
        return null;
    }
}

/**
 * Sepete ürün ekler (Client-side)
 * @param {string} productSlug - Ürün slug'ı (örn: "katya-u")
 * @param {number} quantity - Miktar (varsayılan: 1)
 * @param {Object} [options] - Opsiyonel ek alanlar (hediye kampanyası için vb.)
 * @param {number} [options.selectedGiftProductId] - Seçilen hediye ürün ID'si
 * @param {number} [options.campaignId] - Kampanya ID'si
 * @returns {Promise<Object|null>} Sepet verisi veya null
 */
export async function addToCart(productSlug, quantity = 1, options = {}) {
    if (!productSlug) {
        log("[API cart.js] addToCart: productSlug is required");
        return null;
    }

    try {
        const payload = {
            product_slug: productSlug,
            quantity: quantity,
        };

        // Hediye senaryosu için ek alanları sadece sağlandığında ekle
        if (options && typeof options === "object") {
            const { selectedGiftProductId, campaignId } = options;
            if (selectedGiftProductId != null) {
                payload.selected_gift_product_id = selectedGiftProductId;
            }
            if (campaignId != null) {
                payload.campaign_id = campaignId;
            }
        }

        const response = await apiClient.post("/cart/items", payload);

        if (response?.data?.status === "success") {
            const updatedCart = await getCart();
            return { success: true, cart: updatedCart };
        }

        log("[API cart.js] addToCart failed:", response?.data);
        return { success: false, message: response?.data?.message || "Sepete eklenirken bir hata oluştu." };
    } catch (error) {
        if (error.response) {
            log("[API cart.js] addToCart error response:", {
                status: error.response.status,
                data: error.response.data,
            });
            return { success: false, message: error.response.data?.message || "Sepete eklenirken bir hata oluştu." };
        }
        return { success: false, message: "Ağ hatası veya sistemsel bir sorun oluştu." };
    }
}

/**
 * Sepetten ürün miktarını azaltır (Client-side)
 * Her çağrıda 1 adet azaltır
 * @param {string} productSlug - Ürün slug'ı (örn: "katya-u")
 * @returns {Promise<Object|null>} Güncel sepet verisi veya null
 */
export async function decreaseCartQuantity(productSlug) {
    if (!productSlug) {
        log("[API cart.js] decreaseCartQuantity: productSlug is required");
        return null;
    }

    try {
        const response = await apiClient.post("/cart-minus/items", {
            product_slug: productSlug,
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
        } else if (error.request) {
            log("[API cart.js] decreaseCartQuantity no response:", error.request);
        } else {
            log("[API cart.js] decreaseCartQuantity setup error:", error.message);
        }
        return null;
    }
}

/**
 * Sepetteki ürün miktarını direkt günceller (Client-side)
 * @param {string} productSlug - Ürün slug'ı (örn: "katya-u")
 * @param {number} quantity - Yeni miktar
 * @returns {Promise<Object|null>} Güncel sepet verisi veya null
 */
export async function updateCartQuantity(productSlug, quantity) {
    if (!productSlug) {
        log("[API cart.js] updateCartQuantity: productSlug is required");
        return null;
    }

    if (quantity === undefined || quantity === null || quantity < 1) {
        log("[API cart.js] updateCartQuantity: quantity must be at least 1");
        return null;
    }

    try {
        const response = await apiClient.put("/cart/items", {
            product_slug: productSlug,
            quantity: quantity,
        });

        // updateCartQuantity API'si sadece success mesajı döndürüyor, cart data'sı yok
        // Bu yüzden başarılı olduğunda cart'ı tekrar çekiyoruz
        if (response?.data?.status === "success") {
            // Sepeti tekrar çek (güncel haliyle)
            const updatedCart = await getCart();
            return updatedCart;
        }

        log("[API cart.js] updateCartQuantity failed:", response?.data);
        return null;
    } catch (error) {
        if (error.response) {
            log("[API cart.js] updateCartQuantity error response:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
        } else if (error.request) {
            log("[API cart.js] updateCartQuantity no response:", error.request);
        } else {
            log("[API cart.js] updateCartQuantity setup error:", error.message);
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
            data: {
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
        } else if (error.request) {
            log("[API cart.js] removeFromCart no response:", error.request);
        } else {
            log("[API cart.js] removeFromCart setup error:", error.message);
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
        } else if (error.request) {
            log("[API cart.js] getCartRecommendations no response:", error.request);
        } else {
            log("[API cart.js] getCartRecommendations setup error:", error.message);
        }
        return null;
    }
}

/**
 * Sepeti tamamen temizler (Client-side)
 * @returns {Promise<boolean>} Başarılı mı?
 */
export async function clearCart() {
    try {
        log("[API cart.js] clearCart - İstek gönderiliyor: DELETE /cart");
        const response = await apiClient.delete("/cart");

        if (response?.data?.status === "success") {
            log("[API cart.js] clearCart - Başarılı");
            return true;
        }

        log("[API cart.js] clearCart failed:", response?.data);
        return false;
    } catch (error) {
        log("[API cart.js] clearCart error:", error.message);
        return false;
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
        log("[API cart.js] applyCoupon - İstek gönderiliyor:", {
            endpoint: "/cart/apply-coupon",
            couponCode: couponCode
        });

        const response = await apiClient.post("/cart/apply-coupon", {
            coupon_code: couponCode,
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
            const updatedCart = await getCart();
            log("[API cart.js] applyCoupon - Sepet yenilendi:", {
                cartId: updatedCart?.cartId,
                itemsCount: updatedCart?.items?.length,
                totals: updatedCart?.totals
            });
            return updatedCart;
        }

        // Hata durumu: API'den gelen message'ı kullan, yoksa varsayılan
        const errMsg = response?.data?.message;
        log("[API cart.js] applyCoupon failed:", response?.data);
        return { success: false, message: (errMsg && String(errMsg).trim()) ? errMsg : "Uygulanamadı" };
    } catch (error) {
        const errMsg = error?.response?.data?.message;
        const fallbackMsg = (errMsg && String(errMsg).trim()) ? errMsg : "Uygulanamadı";
        if (error.response) {
            console.log("❌ Kupon Uygulama Hatası (400/500):", error.response.data);
            log("[API cart.js] applyCoupon error response:", {
                status: error.response.status,
                data: error.response.data,
                fullError: error
            });
        } else if (error.request) {
            log("[API cart.js] applyCoupon no response:", { request: error.request });
        } else {
            log("[API cart.js] applyCoupon setup error:", { message: error.message });
        }
        return { success: false, message: fallbackMsg };
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
        log("[API cart.js] removeCoupon - İstek gönderiliyor:", {
            endpoint: "/cart/remove-coupon",
            couponCode: couponCode
        });

        const response = await apiClient.delete("/cart/remove-coupon", {
            data: {
                coupon_code: couponCode,
            }
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
        } else if (error.request) {
            log("[API cart.js] removeCoupon no response:", {
                request: error.request,
                fullError: error
            });
        } else {
            log("[API cart.js] removeCoupon setup error:", {
                message: error.message,
                fullError: error
            });
        }
        return null;
    }
}
