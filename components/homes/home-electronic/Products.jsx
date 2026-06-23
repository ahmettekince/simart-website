import ProductsClient from "./ProductsClient";

export default function Products({ products = [], lang = "tr" }) {
  const list = Array.isArray(products) ? products : [];

  if (list.length === 0) return null;

  return <ProductsClient products={list} lang={lang} />;
}
