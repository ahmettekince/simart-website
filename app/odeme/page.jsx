import CheckoutHeader from "@/components/headers/CheckoutHeader";
import Checkout from "@/components/othersPages/Checkout";
import React from "react";

export const metadata = {
  title: "Ödeme - Şımart Teknoloji",
  description: "Şımart Teknoloji",
};
export default function page() {
  return (
    <>
      <CheckoutHeader />
      <div className="odeme-page-layout">
        <Checkout />
      </div>
    </>
  );
}
