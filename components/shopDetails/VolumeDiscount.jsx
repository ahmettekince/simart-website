"use client";
import React, { useState, useMemo } from "react";
import { useLangStore } from "@/stores/langStore";

const translations = {
  tr: {
    defaultCampaignName: "Çok Al Az Öde",
    tierName: (qty) => `${qty} Adet Alımda`,
    perUnit: "TL / adet",
    locale: "tr-TR",
    currency: "TL",
  },
  en: {
    defaultCampaignName: "Buy More, Save More",
    tierName: (qty) => `Buy ${qty} Items`,
    perUnit: "TRY / unit",
    locale: "en-US",
    currency: "TRY",
  },
};

function parseBuyPayCampaign(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  const isTurkish = lower.includes("al") && lower.includes("öde");
  const isEnglish = lower.includes("buy") && lower.includes("pay");
  if (!isTurkish && !isEnglish) return null;

  const parts = name.match(/\d+/g);
  if (!parts || parts.length < 2) return null;

  return {
    buy: parseInt(parts[0], 10),
    pay: parseInt(parts[1], 10),
  };
}

export default function VolumeDiscount({ product, setQuantity }) {
  const lang = useLangStore((s) => s.lang);
  const t = translations[lang] || translations.tr;
  const [activeIndex, setActiveIndex] = useState(-1);

  const campaign = product?.tiered_cart_discount_campaigns?.[0];
  const tiers = campaign?.tiers;

  const basePrice = product.discount_price || product.price || 0;

  const processedDiscounts = useMemo(() => {
    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
      return [];
    }

    const formatMoney = (amount) =>
      `${amount.toLocaleString(t.locale)} ${t.currency}`;

    return tiers.map((tier) => {
      const qty = tier.min_quantity;
      let discountAmount = 0;

      const val = Number(tier.discount_value) || 0;

      if (tier.discount_type === "fixed_amount" || tier.discount_type === "fixed") {
        discountAmount = val * qty;
      } else if (tier.discount_type === "percentage" || tier.discount_type === "percent") {
        discountAmount = (basePrice * qty * val) / 100;
      }

      if (discountAmount === 0) {
        const buyPay = parseBuyPayCampaign(campaign.name);
        if (buyPay && qty >= buyPay.buy) {
          const freeItems = Math.floor(qty / buyPay.buy) * (buyPay.buy - buyPay.pay);
          discountAmount = freeItems * basePrice;
        }
      }

      const totalPriceCompare = basePrice * qty;
      const totalPriceRegular = Math.max(0, totalPriceCompare - discountAmount);
      const unitPrice =
        qty > 0 ? Math.floor((totalPriceRegular / qty) * 100) / 100 : 0;
      const savePercent =
        totalPriceCompare > 0 ? Math.round((discountAmount / totalPriceCompare) * 100) : 0;

      return {
        name: t.tierName(qty),
        percent: null,
        priceCompare:
          totalPriceCompare > basePrice ? formatMoney(totalPriceCompare) : null,
        priceRegular: formatMoney(totalPriceRegular),
        unitPrice: `${unitPrice.toLocaleString(t.locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${t.perUnit}`,
        value: qty,
        hasDiscount: discountAmount > 0,
        savePercent,
      };
    });
  }, [tiers, basePrice, campaign?.name, t]);

  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  return (
    <div className="tf-product-volume-discount" style={{ marginTop: "16px", marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "700",
          marginBottom: "8px",
          color: "#111",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            backgroundColor: "#3c81b5",
            width: "4px",
            height: "16px",
            borderRadius: "2px",
          }}
        />
        {campaign.name || t.defaultCampaignName}
      </div>
      <div className="flat-check-list list-volume-discount">
        {processedDiscounts.map((discount, index) => (
          <div
            key={index}
            className={`check-item volume-discount-item ${
              index === activeIndex ? "active" : ""
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
              transition: "all 0.2s",
            }}
          >
            <div
              className="rule-item-summary"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
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
                  flexShrink: 0,
                }}
              >
                {index === activeIndex && (
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#3c81b5",
                    }}
                  />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h5
                  className="name"
                  style={{ fontSize: "13px", fontWeight: "700", margin: 0, color: "#111" }}
                >
                  {discount.name}
                </h5>
                <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                  {discount.unitPrice}
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end" style={{ gap: "2px" }}>
              <div className="rule-price-total" style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    className="price-regular"
                    style={{ fontSize: "16px", fontWeight: "800", color: "#3c81b5" }}
                  >
                    {discount.priceRegular}
                  </div>
                  {discount.priceCompare && (
                    <div
                      className="price-compare"
                      style={{
                        fontSize: "12px",
                        textDecoration: "line-through",
                        color: "#9ca3af",
                      }}
                    >
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
