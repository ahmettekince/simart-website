/**
 * Ürün stok durumuna göre buton metni ve durumunu belirler
 * @param {Object} product - Ürün objesi
 * @param {string} lang - Dil kodu (tr/en)
 * @returns {Object} { buttonText: string, buttonDisabled: boolean }
 */
export function getProductButtonState(product, lang = "tr") {
  const isInStock = product?.is_in_stock || false;
  const unlimitedStock = product?.unlimited_stock || false;
  const isPreOrder = product?.is_pre_order || false;
  const stockQuantity = product?.stock_quantity || 0;

  const translations = {
    tr: {
      addToCart: "Sepete Ekle",
      outOfStock: "Stokta Yok",
      preOrder: "Ön Sipariş Ver",
      lastItems: (qty) => `Son ${qty} ürün`,
      museum: "Türkiye'nin İlk Robot Süpürgesi"
    },
    en: {
      addToCart: "Add to Cart",
      outOfStock: "Out of Stock",
      preOrder: "Pre-order Now",
      lastItems: (qty) => `Only ${qty} left`,
      museum: "Turkey's First Robot Vacuum"
    }
  };

  const t = translations[lang] || translations.tr;

  let buttonText = t.addToCart;
  let buttonDisabled = false;

  // Özel Durum: Katya Akıllı Robot Süpürge (Yadigar Model)
  if (product?.name === "katya Robot Süpürge" || product?.name === "katya Robot Vacuum") {
    return {
      buttonText: t.museum,
      buttonDisabled: true,
    }
  }

  // Stok durumuna göre buton metni
  if (isInStock) {
    if (unlimitedStock) {
      buttonText = t.addToCart;
    } else {
      buttonText = t.lastItems(stockQuantity);
    }
  } else {
    if (isPreOrder) {
      buttonText = t.preOrder;
    } else {
      buttonText = t.outOfStock;
      buttonDisabled = true;
    }
  }

  return {
    buttonText,
    buttonDisabled,
  };
}
