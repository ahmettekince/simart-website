import Footer from "@/components/footers/Footer";
import Header from "@/components/headers/Header";

import ProductStyle3 from "@/components/shop/ProductStyle3";
import ProductStyle4 from "@/components/shop/ProductStyle4";
import React from "react";

export const metadata = {
  title: "Product Style 5 || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">New Arrival</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Fashion
          </p>
        </div>
      </div>
      <ProductStyle4 />
      <Footer />
    </>
  );
}
