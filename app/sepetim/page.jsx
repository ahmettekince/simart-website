import Header from "@/components/headers/Header";
import Cart from "@/components/othersPages/Cart";
import React from "react";

export const metadata = {
  title: "Sepetim - Şımart Teknoloji",
  description: "Sepetim sayfası. Sepetinizdeki ürünleri görüntüleyin ve sipariş verin.",
};
export default function page() {
  return (
    <>
      <Header />
      <Cart />

    </>
  );
}
