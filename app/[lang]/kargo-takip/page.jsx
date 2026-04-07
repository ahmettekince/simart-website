import React from "react";
import OrderTrackingForm from "./OrderTrackingForm";

export async function generateMetadata({ params }) {
  const { lang } = params;
  
  if (lang === "en") {
    return {
      title: "Order Tracking - Şımart Teknoloji",
      description: "Track your order status and shipping details.",
    };
  }

  return {
    title: "Kargo Takip - Şımart Teknoloji",
    description: "Siparişinizi takip edin ve kargo durumunu öğrenin.",
  };
}

export default function OrderTracking() {
  return (
    <>
      <OrderTrackingForm />
    </>
  );
}
