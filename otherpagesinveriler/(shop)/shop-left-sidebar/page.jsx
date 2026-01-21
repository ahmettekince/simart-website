import Footer from "@/components/footers/Footer";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import React from "react";

export const metadata = {
  title: "Shop Left Sidebar || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <div className="heading text-center">New Arrival</div>
              <p className="text-center text-2 text_black-2 mt_5">Shop through our latest selection of Fashion</p>
            </div>
          </div>
        </div>
      </div>
      <ShopSidebarleft />
      <Footer />
    </>
  );
}
