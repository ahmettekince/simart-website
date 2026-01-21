import { products1 } from "@/data/products";
import React from "react";
import ProductCardSimart from "../shopCards/ProductCardSimart";
import Productcard23 from "../../otherpagesinveriler/shopCards/Productcard23";

export default function ProductGrid({ gridItems = 4, allproducts = products1 }) {
  return (
    <>
      <div
        style={{
          width: "fit-content",
          margin: "0  auto",
          fontSize: "17px",
          marginBottom: "24px",
        }}
      >
        {allproducts.length} product(s) found
      </div>
      {gridItems == 1 ? (
        <div className="grid-layout list-view" data-grid="grid-list">
          {allproducts.map((elm, i) => (
            <ProductCardSimart product={elm} key={i} />
          ))}
        </div>
      ) : (
        <div className="grid-layout wrapper-shop" data-grid={`grid-${gridItems}`}>
          {/* card product 1 */}
          {allproducts.map((elm, i) => (
            <ProductCardSimart product={elm} key={i} />
          ))}
        </div>
      )}
    </>
  );
}
