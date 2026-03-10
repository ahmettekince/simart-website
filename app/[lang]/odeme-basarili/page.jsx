
import PaymentConfirmation from "@/components/othersPages/PaymentConfirmation";
import React from "react";

export const metadata = {
  title: "Siparişiniz Onaylandı || Şımart Teknoloji",
  description: "Şımart Teknoloji - Siparişiniz Onaylandı",
};
export default function page() {
  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Siparişiniz Onaylandı</div>
        </div>
      </div>

      <PaymentConfirmation />
    </>
  );
}
