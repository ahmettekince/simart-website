import Testimonials from "@/components/common/Testimonials";
import Header from "@/components/headers/Header";
import Cart from "@/components/othersPages/Cart";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import React from "react";

export const metadata = {
  title: "View Cart || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header />
      <Cart />
      <RecentProducts />
    </>
  );
}
