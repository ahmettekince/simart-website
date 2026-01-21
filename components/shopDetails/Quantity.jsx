"use client";

import { useEffect, useState } from "react";

export default function Quantity({ setQuantity = (value) => {}, minQuantity = 1, maxQuantity = null }) {
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
    if (maxQuantity && maxQuantity > 0 && finalCount > maxQuantity) {
      finalCount = maxQuantity;
    }

    setCount(finalCount);
  };

  const handleDecrease = () => {
    const newCount = count - 1;
    if (newCount >= minQuantity) {
      updateCount(newCount);
    }
  };

  const handleIncrease = () => {
    const newCount = count + 1;
    if (!maxQuantity || maxQuantity === 0 || newCount <= maxQuantity) {
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
        max={maxQuantity || undefined}
        type="number"
        onChange={handleInputChange}
        name="number"
        value={count}
      />
      <span
        className={`btn-quantity plus-btn ${maxQuantity && maxQuantity > 0 && count >= maxQuantity ? "disabled" : ""}`}
        onClick={handleIncrease}
        style={{
          opacity: maxQuantity && maxQuantity > 0 && count >= maxQuantity ? 0.5 : 1,
          cursor: maxQuantity && maxQuantity > 0 && count >= maxQuantity ? "not-allowed" : "pointer",
        }}
      >
        +
      </span>
    </div>
  );
}
