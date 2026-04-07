import React from "react";
import OrderTrackingContent from "./OrderTrackingContent";

export async function generateMetadata({ params }) {
  const { lang, orderNumber } = params;
  
  if (lang === "en") {
    return {
      title: `Track Order ${orderNumber} - Şımart Teknoloji`,
      description: "Query your order status.",
    };
  }

  return {
    title: `Kargo Takip ${orderNumber} - Şımart Teknoloji`,
    description: "Sipariş durumunuzu sorgulayın.",
  };
}

export default function OrderTrackingPage({ params }) {
  return (
    <>
      <OrderTrackingContent params={params} />
    </>
  );
}
