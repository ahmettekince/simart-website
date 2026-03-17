"use client";
import { useCallback, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import ProductImageSwiper from "@/components/common/ProductImageSwiper";
import MaxQuantityToast from "@/components/common/MaxQuantityToast";
import ErrorToast from "@/components/common/ErrorToast";
import StarRating from "@/components/common/StarRating";
import CircularLoading from "@/components/common/CircularLoading";
import { getProductButtonState } from "@/utils/productStock";
import { getLocalizedUrl } from "@/utils/i18n";
import { useLangStore } from "@/stores/langStore";

export default function ProductCardSimart({ product, isPriority = false }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const lang = useLangStore((s) => s.lang);
  const cartItems = useCartStore((s) => s.items);
  const [isAdding, setIsAdding] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMaxReachedToast, setShowMaxReachedToast] = useState(false);
  const [maxQuantityForToast, setMaxQuantityForToast] = useState(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("");

  // -- Veriler --
  const title = product.name || product.title;
  const productSlug = product.slug || product.id;
  const isMuseumItem = title === "katya Robot Süpürge";

  // Kategori slug'ını al (ilk kategoriden)
  const getCategorySlug = () => {
    // 1. Direkt prop veya store'dan gelen category_slug
    if (product.category_slug) return product.category_slug;

    // 2. categories array
    if (product.categories && product.categories.length > 0) {
      const category = product.categories[0];
      if (category.slug) return category.slug;
    }

    // 3. primary_category
    const primaryCat = product.primary_category || product.primaryCategory || product.item_category;
    if (primaryCat && primaryCat.slug) return primaryCat.slug;

    // 4. Default
    return "urunler";
  };
  const categorySlug = getCategorySlug();
  const detailUrl = getLocalizedUrl(`/magaza/${categorySlug}/${productSlug}`, lang);

  // Navigasyon Yükleniyor Kontrolü
  const handleNavigate = (e) => {
    // Eğer buton tıklamasıyla çakışıyorsa engelle (gerçi stopPropagation var ama ne olur ne olmaz)
    if (isAdding || showSuccess) return;

    // Eğer link ise varsayılanı engelle (next/link zaten yapıyor ama client-side geçiş için garanti olsun)
    // Sadece sol tık için çalışsın
    if (e.type === 'click' && (e.metaKey || e.ctrlKey)) return; // Ctrl+Click yeni sekme açar, loading gösterme

    e.preventDefault();
    setIsNavigating(true);
    router.push(detailUrl);
  };

  // onHide callback'ini memoize et - sürekli yeni fonksiyon oluşturmasın
  const handleHideToast = useCallback(() => {
    setShowMaxReachedToast(false);
  }, []);

  const handleHideErrorToast = useCallback(() => {
    setShowErrorToast(false);
  }, []);

  const finalPrice = product.discount_price || product.price || 0;
  const oldPrice = product.discount_price ? product.price : null;
  const rating = product.rating || product.average_rating || 0;
  const reviewCount = product.reviews_count || product.review_count || 0;

  // -- Buton Metin Mantığı --
  const { buttonText, buttonDisabled } = getProductButtonState(product);
  // Sepetteki mevcut ürünü bul - tüm olası ID alanlarını kontrol et
  const existingCartItem = useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems) || !product?.id) return null;
    return cartItems.find((it) =>
      it?.product?.id === product.id ||
      it?.id === product.id ||
      it?.productId === product.id ||
      (it?.product && it.product.id === product.id)
    ) || null;
  }, [cartItems, product?.id]);

  // Global sepet başarısı dinleyicisi (Hediye seçimi sonrası vb. animasyonu tetiklemek için)
  useEffect(() => {
    const handleCartSuccess = (e) => {
      if (e.detail?.productId === product?.id) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    };
    window.addEventListener('cart-success', handleCartSuccess);
    return () => window.removeEventListener('cart-success', handleCartSuccess);
  }, [product?.id]);

  // Max bilgisini önce sepetteki item'dan al, yoksa product'tan al
  const rawMax = existingCartItem?.max_purchase_quantity ??
    existingCartItem?.product?.max_purchase_quantity ??
    existingCartItem?.product?.max_quantity ??
    product?.max_purchase_quantity ??
    product?.max_quantity;

  const stockLimit = (!product?.unlimited_stock && product?.stock_quantity != null)
    ? Number(product.stock_quantity)
    : null;

  const effectiveMaxLimit = useMemo(() => {
    let limit = rawMax === 0 || rawMax == null ? null : Number(rawMax);
    // Ön siparişte stok limitini görmezden gel
    if (!product?.is_pre_order && stockLimit !== null) {
      if (limit === null) limit = stockLimit;
      else limit = Math.min(limit, stockLimit);
    }
    return limit === null ? 999 : Math.max(1, limit);
  }, [rawMax, stockLimit, product?.is_pre_order]);

  const isStockLimitTriggered = useMemo(() => {
    if (product?.is_pre_order) return false;
    if (stockLimit === null) return false;
    let purchaseLimit = rawMax === 0 || rawMax == null ? null : Number(rawMax);
    if (purchaseLimit === null) return true;
    return stockLimit <= purchaseLimit;
  }, [rawMax, stockLimit, product?.is_pre_order]);

  return (
    <div className="product-card-simart">
      <MaxQuantityToast visible={showMaxReachedToast} onHide={handleHideToast} maxQuantity={maxQuantityForToast} isStockLimit={isStockLimitTriggered} />
      <ErrorToast visible={showErrorToast} onHide={handleHideErrorToast} message={errorToastMessage} />
      {/* Yükleniyor Overlay - Sayfa Geçişi İçin */}
      {isNavigating && (
        <div className="card-loading-overlay">
          <CircularLoading />
        </div>
      )}

      {/* Üst Kısım: Görsel (Ölçek ve Kalite Korundu) */}
      <div className="card-image-area" onClick={handleNavigate} style={{ cursor: "pointer" }}>
        <ProductImageSwiper
          images={product.images || []}
          productSlug={productSlug}
          productName={title}
          width={500}
          height={500}
          sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 320px"
          campaignTags={product.campaign_tags || []}
          categorySlug={categorySlug}
          isPriority={isPriority}
        />
      </div>

      <div className="card-content-area">
        <div className="title-slot">
          <Link href={detailUrl} className="product-title" onClick={handleNavigate}>
            {title}
          </Link>
        </div>

        <div className="rating-slot">
          {reviewCount > 0 && <StarRating rating={rating} reviewCount={reviewCount} size="medium" />}
        </div>

        <div className="price-slot">
          {!isMuseumItem && buttonText !== "Stokta Yok" && (
            <>
              <span className={`price-new fw-bold ${oldPrice ? "price-discount" : "price-normal"}`}>
                {finalPrice.toLocaleString("tr-TR")} TL
              </span>
              {oldPrice && <span className="price-old">{oldPrice.toLocaleString("tr-TR")} TL</span>}
            </>
          )}
        </div>

        <div className="button-row">
          <div className="flex-grow-1">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (isMuseumItem) {
                  handleNavigate(e);
                  return;
                }
                if (isAdding || showSuccess) return;

                // Ön sipariş ise ürün detayına yönlendir
                if (product.is_pre_order) {
                  handleNavigate(e);
                  return;
                }

                // Max kontrolü - eğer max'a ulaşıldıysa toast göster ve istek atma
                const currentQty = existingCartItem?.quantity || 0;
                const qtyToAdd = 1;

                // Max kontrolü: mevcut miktar zaten max'a ulaşmışsa
                if (effectiveMaxLimit < 999 && currentQty >= effectiveMaxLimit) {
                  setMaxQuantityForToast(effectiveMaxLimit);
                  setShowMaxReachedToast(true);
                  return;
                }

                // Max kontrolü: eklenecek miktar + mevcut miktar max'ı aşıyorsa
                if (effectiveMaxLimit < 999 && currentQty + qtyToAdd > effectiveMaxLimit) {
                  setMaxQuantityForToast(effectiveMaxLimit);
                  setShowMaxReachedToast(true);
                  return;
                }

                setIsAdding(true);
                try {
                  const result = await addItem(product, qtyToAdd, false);
                  if (result?.added) {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 2000);
                  } else if (result?.error === 'MAX_QUANTITY_REACHED' || result?.error) {
                    // Store'dan gelen max quantity hatası veya diğer hatalar
                    const maxQty = result?.maxQuantity || effectiveMaxLimit;
                    if (maxQty < 999) {
                      setMaxQuantityForToast(maxQty);
                      setShowMaxReachedToast(true);
                    }
                  } else {
                    // Diğer hata durumlarını sağ üstte göster
                    setErrorToastMessage(result?.message || "Sepete eklenirken bir hata oluştu.");
                    setShowErrorToast(true);
                  }
                } catch (error) {
                  console.error("Sepete ekleme hatası:", error);
                  setErrorToastMessage(error?.message || "Sistemsel bir hata oluştu. Lütfen tekrar deneyin.");
                  setShowErrorToast(true);
                } finally {
                  setIsAdding(false);
                }
              }}
              disabled={buttonDisabled || isAdding || showSuccess}
              className={`main-cart-btn ${showSuccess ? "success-animation" : ""} ${buttonText === "Stokta Yok" ? "out-of-stock" : ""}`}
              style={{ opacity: 1 }}
            >
              <span className="button-text-main">
                {showSuccess ? "Sepete Eklendi" : isAdding ? "Ekleniyor..." : buttonText}
              </span>
              {showSuccess && <span className="button-text-slide">Sepete Eklendi</span>}
            </button>
          </div>

        </div>
      </div>

      <style jsx>{`
                .card-loading-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(255, 255, 255, 0.6);
                  z-index: 10;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 12px;
                  backdrop-filter: blur(1px);
                }
                .product-card-simart {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
          min-height: 400px;
                    width: 100%;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    position: relative;
                }
                
                /* Görsel Alanı: Kesme Sadece Burada (Tooltip'i engellemesin diye) */
                .card-image-area {
                    overflow: hidden;
                    border-radius: 12px 12px 0 0;
          flex-shrink: 0;
                    transform: translateZ(0);
                }

                .card-content-area {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    padding: 1px 12px 8px 8px;
                    min-height: 0;
                    justify-content: flex-end;
                }

                /* Hizalama Slotları */
        .title-slot {
          height: 40px;
          overflow: hidden;
          flex-shrink: 0;
          font-weight: bold;         
        }
        .rating-slot {
          height: 20px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .price-slot {
          height: 24px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          
        }
        .button-row {
          display: flex;
          gap: 8px;
          align-items: center;
          width: 100%;
          flex-shrink: 0;
        }
        .button-row .flex-grow-1 {
          flex: 1;
          min-width: 0;
          display: flex;
          width: 100%;
        }
  
        .price-old {
          font-size: 14px;
          text-decoration: line-through;
          color: #999;
          margin-left: 10px;
        }
        .price-new {
          font-size: 18px;
        }
        .price-new.price-normal {
          color: #3c81b5;
        }
        .price-new.price-discount {
          color: #0bc15c;
        }
                
        .main-cart-btn {
          width: 100%;
          height: 38px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          align-items: center;
          padding: 0 16px;
          display: flex;
          text-align: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          border: 1px solid var(--primary);
          background: var(--primary);
          color: #fff;
          cursor: pointer;
        }

        .main-cart-btn:disabled {
          opacity: 1 !important;
          cursor: not-allowed;
        }

        .main-cart-btn.out-of-stock {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
        }

        .main-cart-btn.out-of-stock:disabled {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
          opacity: 1 !important;
        }

        .main-cart-btn .button-text-main,
        .main-cart-btn .button-text-slide {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          width: 100%;
          flex: 1;
          min-width: 0;
          text-align: center;
          position: relative;
        }

        /* Başarı animasyonu - Buton içinden yukarı doğru çıkan yazı */
        .main-cart-btn.success-animation {
          background: #10b981;
          border-color: #10b981;
          overflow: hidden;
        }

        .main-cart-btn.success-animation .button-text-main {
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.2s, transform 0.2s;
        }

        .main-cart-btn.success-animation .button-text-slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          color: #fff;
          z-index: 1;
          animation: slideUpFromButton 2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUpFromButton {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          20% {
            transform: translateY(0);
            opacity: 1;
          }
          80% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
                }
                
                .wish-action-btn {
                    position: relative;
                    width: 38px;
                    height: 38px;
          min-width: 38px;
          min-height: 38px;
          max-width: 38px;
          max-height: 38px;
                    border-radius: 50%;
                    border: 1px solid #ddd;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
          flex-shrink: 0;
          padding: 0;
                }
        .wish-action-btn:hover:not(:active) {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .wish-action-btn.active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .wish-action-btn:active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .wish-action-btn i {
          font-size: 18px;
          line-height: 1;
        }
                
        /* Tooltip (Kesilmeyen Yapı) - Sadece desktop'ta hover ile göster */
                .action-tooltip {
                    position: absolute;
                    bottom: 115%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #333;
                    color: #fff;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: 0.2s;
                    z-index: 999;
          pointer-events: none;
        }
        /* Sadece hover ile göster (mobilde gösterme) */
        @media (hover: hover) and (pointer: fine) {
          .wish-action-btn:hover .action-tooltip {
            opacity: 1;
            visibility: visible;
          }
        }

                @media (max-width: 768px) {
          .product-card-simart {
            min-height: 0;
          }
          .title-slot {
            line-height: 18px;
            margin-bottom: 4px;
            max-height: 36px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .card-content-area {
            padding: 1px 12px 8px 8px;
          }
          .price-slot {
            margin-bottom: 2px;
          }
          .price-new {
            font-size: 17px;
          }
          .button-row {
            gap: 6px;
          }
          .wish-action-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
            min-height: 36px;
            max-width: 36px;
            max-height: 36px;
          }
          .main-cart-btn {
            height: 36px;
            border-radius: 8px;
          }
          .wish-action-btn i {
            font-size: 16px;
          }
        }
        @media (max-width: 480px) {
          .button-row {
            gap: 4px;
          }
          .wish-action-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
            min-height: 36px;
            max-width: 36px;
            max-height: 36px;
          }
          .wish-action-btn i {
            font-size: 14px;
          }
                }
            `}</style>
    </div>
  );
}
