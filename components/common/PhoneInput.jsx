"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Türkiye telefon numarası input component'i
 * Format: +90 553 810 81 99
 * Başta +90 sabit, kalanını kullanıcı girer, sistem otomatik boşluk ekler
 */
export default function PhoneInput({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder = "+90 5XX XXX XX XX",
  className = "",
  style = {},
  disabled = false,
  ...props
}) {
  const [rawDigits, setRawDigits] = useState(""); // Sadece rakamlar (10 hane)
  const inputRef = useRef(null);
  const hiddenInputRef = useRef(null);

  // Value prop'u değiştiğinde rawDigits'i güncelle
  useEffect(() => {
    if (value) {
      // +90'ı çıkar ve sadece rakamları al
      const cleanValue = value.startsWith("+90")
        ? value.slice(3).replace(/\D/g, "")
        : value.replace(/\D/g, "");
      setRawDigits(cleanValue.slice(0, 10));
    } else {
      setRawDigits("");
    }
  }, [value]);

  // Rakamları formata çevir: +90 553 810 81 99
  const formatPhoneNumber = (digits) => {
    if (!digits) return "+90 ";

    let formatted = "+90 ";

    // İlk 3 rakam (5XX)
    if (digits.length > 0) {
      formatted += digits.slice(0, 3);
      if (digits.length > 3) formatted += " ";
    }

    // İkinci 3 rakam (XXX)
    if (digits.length > 3) {
      formatted += digits.slice(3, 6);
      if (digits.length > 6) formatted += " ";
    }

    // Üçüncü 2 rakam (XX)
    if (digits.length > 6) {
      formatted += digits.slice(6, 8);
      if (digits.length > 8) formatted += " ";
    }

    // Son 2 rakam (XX)
    if (digits.length > 8) {
      formatted += digits.slice(8, 10);
    }

    return formatted;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // +90'ı çıkar ve sadece rakamları al
    let digits = inputValue.startsWith("+90")
      ? inputValue.slice(3).replace(/\D/g, "")
      : inputValue.replace(/\D/g, "");

    // Maksimum 10 hane
    digits = digits.slice(0, 10);

    setRawDigits(digits);

    // Formatlanmış değeri oluştur
    const formattedValue = formatPhoneNumber(digits);

    // Hidden input'a tam değeri kaydet
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = formattedValue.trim();
    }

    // Parent component'e bildir
    if (onChange) {
      onChange(formattedValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    // Backspace veya Delete için özel işlem
    if (e.key === "Backspace" && inputRef.current) {
      const cursorPos = inputRef.current.selectionStart;
      const value = inputRef.current.value;

      // Eğer cursor +90'dan önceyse, silmeyi engelle
      if (cursorPos <= 4) {
        e.preventDefault();
        return;
      }
    }
  };

  const handleFocus = (e) => {
    // Focus olduğunda cursor'u +90'dan sonraya al
    if (e.target.value === "+90 " || e.target.value === "") {
      setTimeout(() => {
        e.target.setSelectionRange(4, 4);
      }, 0);
    }
  };

  const displayValue = formatPhoneNumber(rawDigits);

  return (
    <>
      <input
        ref={inputRef}
        type="tel"
        id={id}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        required={required}
        placeholder={placeholder}
        className={className}
        style={style}
        disabled={disabled}
        {...props}
      />
      {/* Form submit için hidden input */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        value={displayValue.trim()}
      />
    </>
  );
}
