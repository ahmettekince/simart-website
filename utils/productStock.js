/**
 * Ürün stok durumuna göre buton metni ve durumunu belirler
 * @param {Object} product - Ürün objesi
 * @returns {Object} { buttonText: string, buttonDisabled: boolean }
 */
export function getProductButtonState(product) {
  const isInStock = product?.is_in_stock || false;
  const unlimitedStock = product?.unlimited_stock || false;
  const isPreOrder = product?.is_pre_order || false;
  const stockQuantity = product?.stock_quantity || 0;

  let buttonText = "Sepete Ekle";
  let buttonDisabled = false;

  // Özel Durum: Katya Akıllı Robot Süpürge (Yadigar Model)
  if (product?.name === "katya Robot Süpürge") {
    return {
      buttonText: "Türkiye'nin İlk Robot Süpürgesi",
      buttonDisabled: true,
    }
  }

  // Stok durumuna göre buton metni
  if (isInStock) {
    if (unlimitedStock) {
      buttonText = "Sepete Ekle";
    } else {
      buttonText = `Son ${stockQuantity} ürün`;
    }
  } else {
    if (isPreOrder) {
      buttonText = "Ön Sipariş Ver";
    } else {
      buttonText = "Stokta Yok";
      buttonDisabled = true;
    }
  }

  return {
    buttonText,
    buttonDisabled,
  };
}
