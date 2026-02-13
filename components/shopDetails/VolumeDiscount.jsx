"use client";
import { useCartStore } from "@/stores/cartStore";
import React, { useState, useMemo } from "react";

export default function VolumeDiscount({ product, setQuantity }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // tiered_cart_discount_campaigns kontrolü
  const campaign = product?.tiered_cart_discount_campaigns?.[0];
  const tiers = campaign?.tiers;

  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  const basePrice = product.discount_price || product.price || 0;

  const processedDiscounts = useMemo(() => {
    return tiers.map((tier) => {
      const qty = tier.min_quantity;
      let discountAmount = 0;

      const val = Number(tier.discount_value) || 0;

      if (tier.discount_type === "fixed_amount" || tier.discount_type === "fixed") {
        discountAmount = val;
      } else if (tier.discount_type === "percentage" || tier.discount_type === "percent") {
        discountAmount = (basePrice * qty * val) / 100;
      }

      // Eğer discount_value 0 ise ama kampanya ismi "X Al Y Öde" şeklindeyse mantık yürüt
      if (discountAmount === 0 && campaign.name?.toLowerCase().includes("al") && campaign.name?.toLowerCase().includes("öde")) {
        const parts = campaign.name.match(/\d+/g);
        if (parts && parts.length >= 2) {
          const buy = parseInt(parts[0]);
          const pay = parseInt(parts[1]);
          if (qty >= buy) {
            // Basitçe her 'buy' adet için 1 tanesi bedava gibi düşünelim (veya oranla)
            const freeItems = Math.floor(qty / buy) * (buy - pay);
            discountAmount = freeItems * basePrice;
          }
        }
      }

      const totalPriceCompare = basePrice * qty;
      const totalPriceRegular = Math.max(0, totalPriceCompare - discountAmount);
      const unitPrice = qty > 0 ? Math.floor((totalPriceRegular / qty) * 100) / 100 : 0;
      const savePercent = totalPriceCompare > 0 ? Math.round((discountAmount / totalPriceCompare) * 100) : 0;

      return {
        name: `${qty} Adet Alımda`,
        percent: null,
        priceCompare: totalPriceCompare > basePrice ? `${totalPriceCompare.toLocaleString("tr-TR")} TL` : null,
        priceRegular: `${totalPriceRegular.toLocaleString("tr-TR")} TL`,
        unitPrice: `${unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL / adet`,
        value: qty,
        hasDiscount: discountAmount > 0
      };
    });
  }, [tiers, basePrice, campaign.name]);

  return (
    <div className="tf-product-volume-discount" style={{ marginTop: "16px", marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "700",
          marginBottom: "8px",
          color: "#111",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ backgroundColor: "#3c81b5", width: "4px", height: "16px", borderRadius: "2px" }}></div>
          {campaign.name || "Çok Al Az Öde"}
        </div>
        {campaign.description && (
          <div style={{ fontSize: "12px", fontWeight: "400", color: "#6b7280", paddingLeft: "12px" }}>
            {campaign.description}
          </div>
        )}
      </div>
      <div className="flat-check-list list-volume-discount">
        {processedDiscounts.map((discount, index) => (
          <div
            key={index}
            className={`check-item volume-discount-item ${index === activeIndex ? "active" : ""
              }`}
            onClick={() => {
              setActiveIndex(index);
              if (setQuantity) setQuantity(discount.value);
            }}
            style={{
              padding: "8px 14px",
              border: index === activeIndex ? "1px solid #3c81b5" : "1px solid #e5e7eb",
              borderRadius: "10px",
              backgroundColor: index === activeIndex ? "#f0f7ff" : "#fff",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <div className="rule-item-summary" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="check-radio"
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid #3c81b5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                {index === activeIndex && (
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3c81b5" }}></div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h5 className="name" style={{ fontSize: "13px", fontWeight: "700", margin: 0, color: "#111" }}>
                  {discount.name}
                </h5>
                <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                  {discount.unitPrice}
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end" style={{ gap: "2px" }}>
              {/* Tasarruf kısmı kaldırıldı */}
              <div className="rule-price-total" style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", justifyContent: "flex-end" }}>
                  <div className="price-regular" style={{ fontSize: "16px", fontWeight: "800", color: "#0bc15c" }}>
                    {discount.priceRegular}
                  </div>
                  {discount.priceCompare && (
                    <div className="price-compare" style={{ fontSize: "12px", textDecoration: "line-through", color: "#9ca3af" }}>
                      {discount.priceCompare}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
