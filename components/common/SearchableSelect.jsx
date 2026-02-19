"use client";
import { useState, useMemo, useRef, useEffect } from "react";

/**
 * SearchableSelect Component
 * Arama özellikli dropdown select component'i
 * 
 * @param {Array} options - Seçenekler listesi [{id, name}, ...]
 * @param {string} value - Seçili değer (option.id)
 * @param {function} onChange - Değer değiştiğinde çağrılacak fonksiyon (value) => {}
 * @param {string} placeholder - Placeholder metni
 * @param {boolean} disabled - Disabled durumu
 * @param {string} name - Form input name
 * @param {string} id - Form input id
 * @param {boolean} required - Required durumu
 * @param {string} searchPlaceholder - Arama input placeholder
 * @param {function} onOpen - Dropdown açıldığında çağrılacak fonksiyon (lazy loading için)
 */
export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Seçiniz",
  disabled = false,
  name,
  id,
  required = false,
  searchPlaceholder = "Ara...",
  onOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // value null veya undefined ise boş string kullan
  const safeValue = value != null ? String(value) : "";

  const selectedOption = options.find((opt) => {
    if (!opt || opt.id == null) return false;
    return String(opt.id) === safeValue;
  });
  const displayText = selectedOption ? selectedOption.name : placeholder;

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Açıldığında search input'una focus ver
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    if (option && option.id != null) {
      onChange(option.id.toString());
    } else {
      console.warn("Seçilen opsiyonun ID'si geçersiz:", option);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="select-custom" style={{ position: "relative" }} ref={dropdownRef}>
      <input
        type="hidden"
        name={name}
        id={id}
        value={safeValue}
        required={required}
      />
      <div
        className={`tf-select w-100 ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => {
          if (!disabled) {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            // İlk açılışta onOpen callback'ini çağır (lazy loading için)
            if (newIsOpen && onOpen && !isOpen) {
              onOpen();
            }
          }
        }}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          position: "relative",
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ flex: 1, color: safeValue ? "inherit" : "#999" }}>{displayText}</span>
        <span
          style={{
            borderBottom: "1.7px solid var(--main, #333)",
            borderRight: "1.7px solid var(--main, #333)",
            height: "8px",
            width: "8px",
            transform: isOpen ? "rotate(-135deg)" : "rotate(45deg)",
            transition: "transform 0.15s ease-in-out",
            marginLeft: "8px",
          }}
        />
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginTop: "4px",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            maxHeight: "300px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              maxHeight: "250px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                key="no-results"
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                Sonuç bulunamadı
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.id || index}
                  onClick={() => handleSelect(option)}
                  className="searchable-select-option"
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: safeValue === String(option.id) ? "#f5f5f5" : "#fff",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (safeValue !== String(option.id)) {
                      e.currentTarget.style.backgroundColor = "#f9f9f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (safeValue !== String(option.id)) {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }
                  }}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
