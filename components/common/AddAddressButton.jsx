"use client";

import SimartButton from "./SimartButton";

export default function AddAddressButton({ onClick, text = "Yeni adres", className = "" }) {
  return (
    <SimartButton
      type="button"
      variant="outline"
      onClick={onClick}
      className={`new-address-btn ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "1px solid currentColor",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          lineHeight: "1",
          fontWeight: "bold",
        }}
      >
        +
      </span>
      <span>{text}</span>
    </SimartButton>
  );
}
