"use client";

import { useEffect, useState } from "react";

export default function Quantity({ setQuantity = (value) => {}, minQuantity = 1, maxQuantity = null }) {
  const parsedMax = maxQuantity === null || maxQuantity === undefined ? null : Number(maxQuantity);
  const effectiveMax =
    parsedMax === 0 ? 999 : (Number.isFinite(parsedMax) ? parsedMax : null);
  const [count, setCount] = useState(minQuantity);

  useEffect(() => {
    setQuantity(count);
  }, [count, setQuantity]);

  // Miktarı güncelle (min ve max kontrolü ile)
  const updateCount = (newCount) => {
    let finalCount = newCount;

    // Minimum kontrolü
    if (finalCount < minQuantity) {
      finalCount = minQuantity;
    }

    // Maksimum kontrolü (varsa)
    if (effectiveMax && effectiveMax > 0 && finalCount > effectiveMax) {
      finalCount = effectiveMax;
    }

    setCount(finalCount);
  };

  const handleDecrease = () => {
    // Minimum 1 kontrolü - 1'den küçük olamaz
    if (count <= minQuantity) {
      return;
    }
    const newCount = count - 1;
    if (newCount >= minQuantity) {
      updateCount(newCount);
    }
  };

  const handleIncrease = () => {
    const newCount = count + 1;
    if (!effectiveMax || effectiveMax === 0 || newCount <= effectiveMax) {
      updateCount(newCount);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = parseInt(e.target.value) || minQuantity;
    updateCount(inputValue);
  };

  return (
    <div className="wg-quantity">
      <span
        className={`btn-quantity minus-btn ${count <= minQuantity ? "disabled" : ""}`}
        onClick={handleDecrease}
        style={{
          opacity: count <= minQuantity ? 0.5 : 1,
          cursor: count <= minQuantity ? "not-allowed" : "pointer",
        }}
      >
        -
      </span>
      <input
        min={minQuantity}
        max={effectiveMax || undefined}
        type="number"
        onChange={handleInputChange}
        name="number"
        value={count}
      />
      <span
        className={`btn-quantity plus-btn ${effectiveMax && effectiveMax > 0 && count >= effectiveMax ? "disabled" : ""}`}
        onClick={handleIncrease}
        style={{
          opacity: effectiveMax && effectiveMax > 0 && count >= effectiveMax ? 0.5 : 1,
          cursor: effectiveMax && effectiveMax > 0 && count >= effectiveMax ? "not-allowed" : "pointer",
        }}
      >
        +
      </span>
    </div>
  );
}
