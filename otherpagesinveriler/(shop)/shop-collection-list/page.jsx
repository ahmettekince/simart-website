import Footer from "@/components/footers/Footer";
import Header from "@/components/headers/Header";
import ShopCollections from "@/components/shop/ShopCollections";

import React from "react";

export const metadata = {
  title:
    "Product Collection List || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header />
      
      <ShopCollections />
      <Footer />
    </>
  );
}
