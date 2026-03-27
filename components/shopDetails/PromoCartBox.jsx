"use client";
import React, { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import Quantity from "./Quantity";
import Image from "next/image";
import { Model3dIcon } from "@/components/common/OverlayCtaButton";

export default function PromoCartBox({
  product,
  couponCode,
  quantity,
  setQuantity,
  minQuantity,
  maxQuantity,
  buttonState,
  promoText = "Bu ürünü 3D simülasyonda incelediniz. İndirimli sipariş sizi bekliyor!",
  onOpen3dModel
}) {
  const { addItem, applyCoupon } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const has3dModel = !!product?.product_details_with_model;

  const handleAddToCartPromo = async () => {
    if (isAdding || showSuccess || buttonState.buttonDisabled) return;

    setIsAdding(true);
    try {
      const result = await addItem(product, quantity, false);
      if (result?.added || result?.success) {
        if (couponCode) {
          await applyCoupon(couponCode);
        }
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Promo adding error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="promo-tr-box d-flex flex-column p-3 mt-3 gap-3">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <div className="promo-icon-bg">
            <Model3dIcon size={24} color="#3c81b5" />
          </div>
          <div className="text-start">
            <div className="fw-bold" style={{ fontSize: "14px", color: "#333" }}>Sana Özel 3D Fırsatı</div>
            <div style={{ fontSize: "13px", color: "#3c81b5", fontWeight: "500" }}>
              {promoText}
            </div>
          </div>
        </div>

        {has3dModel && onOpen3dModel && (
          <button
            onClick={onOpen3dModel}
            className="btn d-flex align-items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #3c81b5",
              borderRadius: "10px",
              color: "#3c81b5",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            <Model3dIcon size={16} color="#3c81b5" />
            3D Modeli Gör
          </button>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 border-top pt-3 mt-1">
        <div className="promo-quantity-wrap">
          <Quantity
            setQuantity={setQuantity}
            initialValue={quantity}
            minQuantity={minQuantity}
            maxQuantity={maxQuantity}
            disabled={buttonState.buttonDisabled}
          />
        </div>
        <button
          type="button"
          onClick={handleAddToCartPromo}
          disabled={isAdding || showSuccess || buttonState.buttonDisabled}
          className="btn promo-tr-btn text-white flex-grow-1 py-2"
          style={{
            backgroundColor: "#3c81b5",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "14px",
            whiteSpace: "nowrap",
            height: "48px"
          }}
        >
          {showSuccess ? "Eklendi!" : "İndirimle Sepete Ekle"}
        </button>
      </div>

      <style jsx global>{`
        .promo-tr-box {
          background-color: #f0f7ff;
          border: 2px solid #3c81b5;
          border-radius: 12px;
        }
        .promo-icon-bg {
          width: 44px;
          height: 44px;
          background: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(60, 129, 181, 0.1);
        }
        .promo-tr-btn:hover {
          background-color: #2d618a !important;
        }
        @media (max-width: 768px) {
          .promo-tr-box { gap: 12px; }
          .promo-tr-btn { flex: 1; }
          .promo-quantity-wrap { transform: scale(0.9); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}
