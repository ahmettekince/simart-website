"use client";

import { useEffect, useState, useRef } from "react";

export default function Quantity({ setQuantity = (value) => { }, minQuantity = 1, maxQuantity = null, initialValue = null, disabled = false, isLoading = false }) {
  // Global maksimum limit
  const GLOBAL_MAX = 999;

  // maxQuantity = 0 ise sınırsız (null), değilse o değere kadar sınırlı
  const parsedMax = maxQuantity === null || maxQuantity === undefined ? null : Number(maxQuantity);
  let effectiveMax = parsedMax === 0 || parsedMax === null ? GLOBAL_MAX : Math.min(parsedMax, GLOBAL_MAX);
  
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
    if (disabled || isLoading) return;
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
    if (disabled || isLoading) return;
    
    const currentCount = Number(count) || 0;
    const newCount = currentCount + 1;
    
    if (newCount <= effectiveMax) {
      const finalValue = updateCount(newCount);
      setQuantity(finalValue);
    }
  };

  const handleInputChange = (e) => {
    if (disabled || isLoading) return;
    isUserInputRef.current = true; // Kullanıcı input'a dokundu
    
    // Sadece rakamlara izin ver (regex ile temizle)
    const inputValue = e.target.value.replace(/\D/g, "");

    // Boş değer ise boş bırak (kullanıcı yazarken kontrol yapma)
    if (inputValue === "") {
      setCount("");
      return;
    }

    // Sadece sayı karakterlerine izin ver
    const numValue = parseInt(inputValue, 10);

    // 0 veya geçersiz ise boş bırak
    if (isNaN(numValue) || numValue < 1) {
      setCount("");
      return;
    }

    // Max kontrolü - eğer max'tan fazlaysa max'a çek ve hemen API'ye istek at
    if (numValue > effectiveMax) {
      const finalValue = effectiveMax;
      setCount(finalValue);
      setQuantity(finalValue); // Hemen API'ye istek at
      return;
    }

    // Geçerli bir sayı ise direkt güncelle
    setCount(numValue);
  };

  const handleInputBlur = (e) => {
    if (isLoading) return;
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

    // Max kontrolü
    let finalValue = numValue;
    if (numValue > effectiveMax) {
      finalValue = effectiveMax;
      setCount(finalValue);
    } else {
      setCount(finalValue);
    }

    // setQuantity'yi sadece blur'da çağır (loop'u önlemek için)
    setQuantity(finalValue);
    isUserInputRef.current = false; // Reset flag
  };

  const isMinusDisabled = disabled || isLoading || count === "" || Number(count) <= minQuantity;
  const isPlusDisabled = disabled || isLoading || count === "" || Number(count) >= effectiveMax;

  return (
    <div className="wg-quantity" style={{ position: "relative" }}>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "inherit",
            zIndex: 5,
          }}
        >
          <div
            className="spinner-border"
            role="status"
            style={{
              width: "16px",
              height: "16px",
              borderWidth: "2px",
              borderColor: "var(--primary, #1c355e)",
              borderRightColor: "transparent",
            }}
          >
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <span style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>Yükleniyor</span>
        </div>
      )}
      <span
        className={`btn-quantity minus-btn ${isMinusDisabled ? "disabled" : ""}`}
        onClick={handleDecrease}
        style={{
          opacity: isMinusDisabled ? 0.5 : 1,
          cursor: isMinusDisabled ? "not-allowed" : "pointer",
        }}
      >
        -
      </span>
      <input
        min={minQuantity}
        max={effectiveMax}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        name="number"
        value={count === "" ? "" : count}
        disabled={disabled}
        style={{
          textAlign: "center",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
        className="quantity-input-no-spinner"
      />
      <span
        className={`btn-quantity plus-btn ${isPlusDisabled ? "disabled" : ""}`}
        onClick={handleIncrease}
        style={{
          opacity: isPlusDisabled ? 0.5 : 1,
          cursor: isPlusDisabled ? "not-allowed" : "pointer",
        }}
      >
        +
      </span>
    </div>
  );
}
