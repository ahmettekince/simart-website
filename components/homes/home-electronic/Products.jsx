import React from "react";
import { getProducts } from "@/api/products";
import ProductsClient from "./ProductsClient";

export default async function Products({ lang = "tr" }) {
  try {
    const products = await getProducts(lang);
    
    if (!Array.isArray(products)) {
      console.error("Products is not an array:", products);
      return <ProductsClient products={[]} lang={lang} />;
    }

    return <ProductsClient products={products} lang={lang} />;
  } catch (error) {
    console.error("Products SSR fetch error:", error);
    return <ProductsClient products={[]} />;
  }
}
