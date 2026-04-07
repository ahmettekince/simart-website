
import Cart from "@/components/othersPages/Cart";
import React from "react";

const translations = {
  tr: {
    title: "Sepetim - Şımart Teknoloji",
    description: "Sepetim sayfası. Sepetinizdeki ürünleri görüntüleyin ve sipariş verin.",
    loading: "Sepet yükleniyor...",
    cartProducts: "Sepetteki Ürünler",
    product: "Ürün",
    price: "Fiyat",
    quantity: "Miktar",
    total: "Toplam",
    remove: "Ürünü kaldır",
    gift: "Hediye",
    giftProduct: "Hediye Ürün",
    campaignGift: "Kampanya Hediyesi",
    specialGift: "Sepet Tutarına Özel Hediye",
    emptyCart: "Sepetiniz boş",
    startShopping: "Alışverişe Başla",
    orderSummary: "Sepet Özeti",
    completeOrder: "Siparişi Tamamla",
    updateError: "Miktar güncellenirken bir hata oluştu.",
    systemError: "Sistemsel bir hata oluştu."
  },
  en: {
    title: "My Cart - Şımart Technology",
    description: "My cart page. View the products in your cart and place an order.",
    loading: "Cart loading...",
    cartProducts: "Products in Cart",
    product: "Product",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    remove: "Remove product",
    gift: "Gift",
    giftProduct: "Gift Product",
    campaignGift: "Campaign Gift",
    specialGift: "Special Gift for Cart Total",
    emptyCart: "Your cart is empty",
    startShopping: "Start Shopping",
    orderSummary: "Order Summary",
    completeOrder: "Complete Order",
    updateError: "An error occurred while updating the quantity.",
    systemError: "A system error occurred."
  },
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = translations[lang] || translations.tr;
  return {
    title: t.title,
    description: t.description,
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  return (
    <>
      <Cart lang={lang} />
    </>
  );
}
