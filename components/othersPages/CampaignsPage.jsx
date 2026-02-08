"use client";

import React from "react";
import SimartButton from "@/components/common/SimartButton";

export default function CampaignsPage({ campaigns = [] }) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <section className="flat-spacing-11">
        <div className="container">
          <div className="flat-title text-center">
            <span className="title">Kampanyalar</span>
          </div>
          <p className="text-center text-muted" style={{ padding: "40px 0" }}>
            Şu an aktif kampanya bulunmamaktadır.
          </p>
        </div>
      </section>
    );
  }

  const cols = Math.min(campaigns.length, 3);

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="flat-title text-center mb_30">
          <span className="title">Kampanyalar</span>
        </div>
        <div
          className="campaigns-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "24px",
            maxWidth: cols === 1 ? "400px" : "100%",
            marginLeft: cols === 1 ? "0" : "auto",
            marginRight: cols === 1 ? "0" : "auto",
          }}
        >
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="campaign-card"
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "24px",
                backgroundColor: "#fff",
                transition: "box-shadow 0.3s, border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                minHeight: "180px",
              }}
            >
              <div style={{ flex: 1, minHeight: 0 }}>
                <div
                  className="campaign-name"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                    lineHeight: 1.4,
                  }}
                >
                  {campaign.name}
                </div>
                {campaign.description && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {campaign.description}
                  </p>
                )}
                {campaign.details?.source_product && campaign.details?.target_product && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      marginBottom: "12px",
                    }}
                  >
                    <span>{campaign.details.source_product.name}</span>
                    <span style={{ margin: "0 6px" }}>+</span>
                    <span>{campaign.details.target_product.name}</span>
                  </div>
                )}
                {campaign.details?.discount_value && (
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--primary)",
                    }}
                  >
                    {campaign.details.discount_type === "fixed"
                      ? `${Number(campaign.details.discount_value).toLocaleString("tr-TR")} TL indirim`
                      : `%${campaign.details.discount_value} indirim`}
                  </div>
                )}
              </div>
              <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                <SimartButton href="/magaza">Ürünleri Gör</SimartButton>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        .campaigns-grid .campaign-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--primary) !important;
        }
        @media (max-width: 768px) {
          .campaigns-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
