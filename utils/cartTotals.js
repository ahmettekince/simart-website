/**
 * Sepet tutarlarını hesaplayan ortak fonksiyon
 * ShopCart ve OrderSummary component'lerinde kullanılır
 * 
 * @param {Object} totals - API'den gelen totals objesi
 * @param {Array} items - Sepet ürünleri
 * @returns {Object} Hesaplanmış tutar objesi
 */
export function calculateCartTotals(totals, items) {
  if (totals && totals.total !== null && totals.total !== undefined) {
    // API'den gelen totals kullan
    const subtotal = totals.subtotal || 0;
    const customDiscountAmount = totals.custom_discount_amount || 0;
    const campaignDiscountAmount = totals.campaign_discount_amount || 0;
    const couponDiscountAmount = totals.coupon_discount_amount || 0;
    const discount = totals.discountAmount || totals.discount_amount || 0;
    const total = totals.total || 0;

    return {
      subtotal,
      customDiscountAmount,
      campaignDiscountAmount,
      couponDiscountAmount,
      discount,
      total,
      hasAnyDiscount: customDiscountAmount > 0 || campaignDiscountAmount > 0 || couponDiscountAmount > 0 || discount > 0
    };
  }

  // Fallback: local hesaplama (API'den totals gelmemişse)
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    return total + itemPrice * item.quantity;
  }, 0);

  const discountedTotal = items.reduce((total, item) => {
    const itemPrice = item.discount_price || item.price || 0;
    return total + itemPrice * item.quantity;
  }, 0);

  const discount = subtotal - discountedTotal;

  return {
    subtotal: subtotal,
    customDiscountAmount: 0,
    campaignDiscountAmount: 0,
    couponDiscountAmount: 0,
    discount: discount > 0 ? discount : 0,
    total: discountedTotal,
    hasAnyDiscount: discount > 0
  };
}
