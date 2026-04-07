"use client";
import React, { useEffect, useState } from "react";
import { useLangStore } from "@/stores/langStore";

const sortingOptions = {
  tr: [
    { text: "Önerilen Sıralama", value: "default" },
    { text: "Alfabetik, A-Z", value: "a-z" },
    { text: "Alfabetik, Z-A", value: "z-a" },
    { text: "En düşük fiyat", value: "price-low" },
    { text: "En yüksek fiyat", value: "price-high" },
  ],
  en: [
    { text: "Sort by Recommended", value: "default" },
    { text: "Alphabetically, A-Z", value: "a-z" },
    { text: "Alphabetically, Z-A", value: "z-a" },
    { text: "Price, low to high", value: "price-low" },
    { text: "Price, high to low", value: "price-high" },
  ]
};

export default function Sorting({ products = [], setFinalSorted }) {
  const lang = useLangStore((s) => s.lang);
  const options = sortingOptions[lang] || sortingOptions.tr;
  const [selectedOptions, setSelectedOptions] = useState(options[0]);

  // Dil değiştiğinde seçili opsiyonu güncelle
  useEffect(() => {
    const currentVal = selectedOptions.value;
    const newOption = options.find(o => o.value === currentVal) || options[0];
    setSelectedOptions(newOption);
  }, [lang, options]);

  useEffect(() => {
    const currentValue = selectedOptions.value;

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

    if (currentValue === "default") {
      // Önerilen sıralamada sadece stok durumuna bakarak başla
      setFinalSorted([...products].sort((a, b) => baseSort(a, b, () => 0)));
    } else if (currentValue === "a-z") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const nameA = (item1.name || item1.title || "").toLowerCase();
            const nameB = (item2.name || item2.title || "").toLowerCase();
            return nameA.localeCompare(nameB);
          })
        )
      );
    } else if (currentValue === "z-a") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const nameA = (item1.name || item1.title || "").toLowerCase();
            const nameB = (item2.name || item2.title || "").toLowerCase();
            return nameB.localeCompare(nameA);
          })
        )
      );
    } else if (currentValue === "price-low") {
      setFinalSorted(
        [...products].sort((a, b) =>
          baseSort(a, b, (item1, item2) => {
            const priceA = item1.discount_price || item1.price || 0;
            const priceB = item2.discount_price || item2.price || 0;
            return priceA - priceB;
          })
        )
      );
    } else if (currentValue === "price-high") {
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
        {options.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedOptions(item)}
            className={`select-item ${item.value == selectedOptions.value ? "active" : ""}`}
          >
            <span className="text-value-item">{item.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
