"use client";

import { useEffect, useState, useRef } from "react";

export default function Quantity({ setQuantity = (value) => { }, minQuantity = 1, maxQuantity = null, initialValue = null }) {
  // maxQuantity = 0 ise sınırsız (null), değilse o değere kadar sınırlı
  const parsedMax = maxQuantity === null || maxQuantity === undefined ? null : Number(maxQuantity);
  const effectiveMax = parsedMax === 0 ? null : (Number.isFinite(parsedMax) ? parsedMax : null);
  // initialValue varsa onu kullan, yoksa minQuantity kullan
  const [count, setCount] = useState(initialValue !== null && initialValue !== undefined ? initialValue : minQuantity);

  // Kullanıcı input'a dokundu mu kontrolü (loop'u önlemek için)
  const isUserInputRef = useRef(false);
  const lastInitialValueRef = useRef(initialValue);

  // initialValue değiştiğinde count'u güncelle (sadece kullanıcı input'a dokunmamışsa ve gerçekten değiştiyse)
  useEffect(() => {
    // initialValue gerçekten değiştiyse ve kullanıcı input'a dokunmamışsa güncelle
    const currentInitial = initialValue !== null && initialValue !== undefined ? initialValue : minQuantity;
    const lastInitial = lastInitialValueRef.current !== null && lastInitialValueRef.current !== undefined ? lastInitialValueRef.current : minQuantity;
    
    if (currentInitial !== lastInitial && !isUserInputRef.current) {
      // Sadece görseli güncelle, setQuantity çağırma (loop'u önlemek için)
      setCount(currentInitial);
      lastInitialValueRef.current = currentInitial;
    } else if (currentInitial !== lastInitial) {
      lastInitialValueRef.current = currentInitial;
    }
  }, [initialValue, minQuantity]);

  // Miktarı güncelle (min ve max kontrolü ile)
  const updateCount = (newCount) => {
    let finalCount = newCount;

    // Minimum kontrolü
    if (finalCount < minQuantity) {
      finalCount = minQuantity;
    }

    // Maksimum kontrolü (sadece maxQuantity 0 değilse kontrol et)
    if (effectiveMax !== null && effectiveMax !== undefined && effectiveMax > 0 && finalCount > effectiveMax) {
      finalCount = effectiveMax;
    }

    setCount(finalCount);
    return finalCount; // Final değeri döndür
  };

  const handleDecrease = () => {
    // Minimum 1 kontrolü - 1'den küçük olamaz
    if (count <= minQuantity) {
      return;
    }
    const newCount = count - 1;
    if (newCount >= minQuantity) {
      const finalValue = updateCount(newCount);
      setQuantity(finalValue); // setQuantity'yi direkt çağır
    }
  };

  const handleIncrease = () => {
    const newCount = count + 1;
    // effectiveMax null ise sınırsız, değilse kontrol et
    if (effectiveMax === null || effectiveMax === undefined || newCount <= effectiveMax) {
      const finalValue = updateCount(newCount);
      setQuantity(finalValue); // setQuantity'yi direkt çağır
    }
  };

  const handleInputChange = (e) => {
    isUserInputRef.current = true; // Kullanıcı input'a dokundu
    const inputValue = e.target.value;

    // Boş değer ise boş bırak (kullanıcı yazarken kontrol yapma)
    if (inputValue === "" || inputValue === null || inputValue === undefined) {
      setCount("");
      return;
    }

    // Sadece sayı karakterlerine izin ver
    const numValue = parseInt(inputValue, 10);

    // Geçerli bir sayı değilse veya 0'dan küçükse boş bırak (kullanıcı yazmaya devam edebilsin)
    if (isNaN(numValue) || numValue < 1) {
      setCount("");
      return;
    }

    // Geçerli bir sayı ise direkt güncelle (max kontrolü yapmadan, blur'da yapılacak)
    setCount(numValue);
  };

  const handleInputBlur = (e) => {
    // Input'tan çıkıldığında min/max kontrolü yap
    const inputValue = e.target.value;

    // Boşsa veya geçersizse minQuantity'ye ayarla
    if (inputValue === "" || inputValue === null || inputValue === undefined) {
      const finalValue = minQuantity;
      setCount(finalValue);
      setQuantity(finalValue); // setQuantity'yi sadece blur'da çağır
      isUserInputRef.current = false; // Reset flag
      return;
    }

    const numValue = parseInt(inputValue, 10);

    // Geçerli bir sayı değilse veya min'den küçükse minQuantity'ye ayarla
    if (isNaN(numValue) || numValue < minQuantity) {
      const finalValue = minQuantity;
      setCount(finalValue);
      setQuantity(finalValue); // setQuantity'yi sadece blur'da çağır
      isUserInputRef.current = false; // Reset flag
      return;
    }

    // Max kontrolü (sadece maxQuantity 0 değilse)
    let finalValue = numValue;
    if (effectiveMax !== null && effectiveMax !== undefined && effectiveMax > 0 && numValue > effectiveMax) {
      finalValue = effectiveMax;
      setCount(finalValue);
    } else {
      setCount(finalValue);
    }

    // setQuantity'yi sadece blur'da çağır (loop'u önlemek için)
    setQuantity(finalValue);
    isUserInputRef.current = false; // Reset flag
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .quantity-input-no-spinner::-webkit-inner-spin-button,
          .quantity-input-no-spinner::-webkit-outer-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
            display: none !important;
          }
          .quantity-input-no-spinner {
            -moz-appearance: textfield !important;
          }
        `
      }} />
      <div className="wg-quantity">
        <span
          className={`btn-quantity minus-btn ${(count === "" || count === null || count === undefined || count <= minQuantity) ? "disabled" : ""}`}
          onClick={handleDecrease}
          style={{
            opacity: (count === "" || count === null || count === undefined || count <= minQuantity) ? 0.5 : 1,
            cursor: (count === "" || count === null || count === undefined || count <= minQuantity) ? "not-allowed" : "pointer",
          }}
        >
          -
        </span>
        <input
          min={minQuantity}
          max={effectiveMax || undefined}
          type="number"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          name="number"
          value={count === "" ? "" : count}
          style={{ 
            width: "60px", 
            textAlign: "center",
            WebkitAppearance: "textfield",
            MozAppearance: "textfield"
          }}
          className="quantity-input-no-spinner"
        />
        <span
          className={`btn-quantity plus-btn ${effectiveMax !== null && effectiveMax !== undefined && effectiveMax > 0 && count >= effectiveMax ? "disabled" : ""}`}
          onClick={handleIncrease}
          style={{
            opacity: effectiveMax !== null && effectiveMax !== undefined && effectiveMax > 0 && count >= effectiveMax ? 0.5 : 1,
            cursor: effectiveMax !== null && effectiveMax !== undefined && effectiveMax > 0 && count >= effectiveMax ? "not-allowed" : "pointer",
          }}
        >
          +
        </span>
      </div>
    </>
  );
}
