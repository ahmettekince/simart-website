import CheckoutHeader from "@/components/headers/CheckoutHeader";
import Checkout from "@/components/othersPages/Checkout";
import React from "react";

export const metadata = {
  title: "Ödeme || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
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
