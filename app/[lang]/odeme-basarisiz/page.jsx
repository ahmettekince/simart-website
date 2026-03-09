import Header from "@/components/headers/Header";
import PaymentFailure from "@/components/othersPages/PaymentFailure";
import React from "react";

export const metadata = {
  title: "Ödeme Başarısız | Şımart Teknoloji",
  description: "Şımart Teknoloji",
};
export default function page() {
  return (
    <>
      <Header />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Ödeme Başarısız</div>
        </div>
      </div>

      <PaymentFailure />
    </>
  );
}
