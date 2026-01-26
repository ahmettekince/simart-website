"use client";
import { sortingOptions } from "@/data/shop";
import React, { useEffect, useState } from "react";

export default function Sorting({ products = [], setFinalSorted }) {
  const [selectedOptions, setSelectedOptions] = useState(sortingOptions[0]);

  useEffect(() => {
    const currentLabel = (selectedOptions?.text || "").trim().toLowerCase();
    const defaultLabel = (sortingOptions?.[0]?.text || "").trim().toLowerCase();
    if (
      currentLabel === defaultLabel ||
      currentLabel === "varsayılan" ||
      currentLabel === "önerilen sıralama" ||
      currentLabel === "onerilen siralama"
    ) {
      setFinalSorted([...products]);
    } else if (selectedOptions.text == "Alfabetik, A-Z") {
      setFinalSorted(
        [...products].sort((a, b) => {
          const nameA = (a.name || a.title || "").toLowerCase();
          const nameB = (b.name || b.title || "").toLowerCase();
          return nameA.localeCompare(nameB);
        })
      );
    } else if (selectedOptions.text == "Alfabetik, Z-A") {
      setFinalSorted(
        [...products].sort((a, b) => {
          const nameA = (a.name || a.title || "").toLowerCase();
          const nameB = (b.name || b.title || "").toLowerCase();
          return nameB.localeCompare(nameA);
        })
      );
    } else if (selectedOptions.text == "En düşük fiyat") {
      setFinalSorted(
        [...products].sort((a, b) => {
          const priceA = a.discount_price || a.price || 0;
          const priceB = b.discount_price || b.price || 0;
          return priceA - priceB;
        })
      );
    } else if (selectedOptions.text == "En yüksek fiyat") {
      setFinalSorted(
        [...products].sort((a, b) => {
          const priceA = a.discount_price || a.price || 0;
          const priceB = b.discount_price || b.price || 0;
          return priceB - priceA;
        })
      );
    }
  }, [products, selectedOptions, setFinalSorted]);

  return (
    <>
      {" "}
      <div className="btn-select">
        <span className="text-sort-value">{selectedOptions.text}</span>
        <span className="icon icon-arrow-down" />
      </div>
      <div className="dropdown-menu">
        {sortingOptions.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedOptions(item)}
            className={`select-item ${item == selectedOptions ? "active" : ""}`}
          >
            <span className="text-value-item">{item.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
