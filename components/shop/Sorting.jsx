"use client";
import React, { useEffect, useState } from "react";

const sortingOptions = [
  { text: "Önerilen Sıralama" },
  { text: "Alfabetik, A-Z" },
  { text: "Alfabetik, Z-A" },
  { text: "En düşük fiyat" },
  { text: "En yüksek fiyat" },
];

export default function Sorting({ products = [], setFinalSorted }) {
  const [selectedOptions, setSelectedOptions] = useState(sortingOptions[0]);

  useEffect(() => {
    const currentLabel = (selectedOptions?.text || "").trim().toLowerCase();
    const defaultLabel = (sortingOptions?.[0]?.text || "").trim().toLowerCase();

    // Yardımcı: Stokta mı? (Stokta var veya Ön Sipariş)
    const isAvailable = (p) => p.is_in_stock || p.is_pre_order;

    const baseSort = (a, b, compareFn) => {
      const availA = isAvailable(a);
      const availB = isAvailable(b);

      if (availA !== availB) {
        return availA ? -1 : 1;
      }
      return compareFn(a, b);
    };

    if (
      currentLabel === defaultLabel ||
      currentLabel === "varsayılan" ||
      currentLabel === "önerilen sıralama" ||
      currentLabel === "onerilen siralama"
    ) {
      // Önerilen sıralamada sadece stok durumuna bakarak başla
      setFinalSorted([...products].sort((a, b) => baseSort(a, b, () => 0)));
    } else if (selectedOptions.text == "Alfabetik, A-Z") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const nameA = (item1.name || item1.title || "").toLowerCase();
            const nameB = (item2.name || item2.title || "").toLowerCase();
            return nameA.localeCompare(nameB);
          })
        )
      );
    } else if (selectedOptions.text == "Alfabetik, Z-A") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const nameA = (item1.name || item1.title || "").toLowerCase();
            const nameB = (item2.name || item2.title || "").toLowerCase();
            return nameB.localeCompare(nameA);
          })
        )
      );
    } else if (selectedOptions.text == "En düşük fiyat") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const priceA = item1.discount_price || item1.price || 0;
            const priceB = item2.discount_price || item2.price || 0;
            return priceA - priceB;
          })
        )
      );
    } else if (selectedOptions.text == "En yüksek fiyat") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const priceA = item1.discount_price || item1.price || 0;
            const priceB = item2.discount_price || item2.price || 0;
            return priceB - priceA;
          })
        )
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
