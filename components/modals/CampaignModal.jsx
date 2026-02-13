"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import SimartButton from "@/components/common/SimartButton";
import { Ticket, X, Gift } from "lucide-react";

export default function CampaignModal({ open, onClose }) {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchCampaigns = async () => {
                setLoading(true);
                try {
                    const response = await apiClient.get("/campaigns");
                    if (response.data?.status === "success") {
                        const regular = response.data.data?.regular_campaigns || [];
                        const installment = response.data.data?.installment_campaigns || [];
                        setCampaigns([...regular, ...installment]);
                    }
                } catch (error) {
                    console.error("Kampanyalar yüklenirken hata oluştu:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCampaigns();
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="campaign-modal-overlay"
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: 10001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                padding: "20px",
            }}
        >
            <div
                className="campaign-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "80vh",
                    overflow: "hidden",
                    animation: "modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "24px 24px 16px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <h5
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color: "#1a1a1a",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            <Ticket size={18} strokeWidth={2.5} color="#3c81b5" /> Kampanyalar
                        </h5>
                        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0", lineHeight: 1.4 }}>
                            En yeni fırsatlar ve indirimler.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "#f3f4f6",
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#4b5563",
                            transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#e5e7eb")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="campaign-modal-body"
                    style={{
                        padding: "0 24px 24px",
                        overflowY: "auto",
                        flex: 1,
                    }}
                >
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <div className="spinner-border text-primary spinner-border-sm" role="status">
                                <span className="visually-hidden">Yükleniyor...</span>
                            </div>
                        </div>
                    ) : campaigns.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {campaigns.map((campaign, idx) => {
                                const isInstallment = campaign.type === "installment";
                                const discountText = isInstallment
                                    ? (campaign.is_interest_free ? "VADE FARKSIZ" : "TAKSİT FIRSATI")
                                    : (campaign.details?.discount_value
                                        ? (campaign.details.discount_type === "fixed"
                                            ? `-${Number(campaign.details.discount_value).toLocaleString("tr-TR")} TL`
                                            : `%${campaign.details.discount_value} İNDİRİM`)
                                        : null);

                                return (
                                    <div
                                        key={`${campaign.id}-${idx}`}
                                        style={{
                                            backgroundColor: "#f9fafb",
                                            borderRadius: "14px",
                                            padding: "12px 14px",
                                            transition: "transform 0.2s, background-color 0.2s",
                                            cursor: "pointer",
                                            border: "1px solid transparent",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "16px"
                                        }}
                                        className="campaign-item-minimal"
                                        onClick={() => {
                                            onClose();
                                            window.location.href = "/magaza";
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                                <span
                                                    style={{
                                                        fontSize: "13px",
                                                        fontWeight: 700,
                                                        color: "#111827",
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {campaign.name}
                                                </span>
                                                {discountText && (
                                                    <span
                                                        style={{
                                                            fontSize: "10px",
                                                            fontWeight: 700,
                                                            color: "#3c81b5",
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        {discountText}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#6b7280",
                                                    lineHeight: 1.4,
                                                    margin: 0,
                                                }}
                                            >
                                                {campaign.description || "Kampanya detaylarını görmek için tıklayın."}
                                            </p>
                                        </div>
                                        <button
                                            style={{
                                                padding: "8px 14px",
                                                fontSize: "10px",
                                                fontWeight: 800,
                                                backgroundColor: "#3c81b5",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "8px",
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",
                                                transition: "opacity 0.2s",
                                                boxShadow: "0 2px 6px rgba(60, 129, 181, 0.2)"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                                        >
                                            ALIŞVERİŞE BAŞLA
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                            <Gift size={32} strokeWidth={1.5} style={{ marginBottom: "12px", opacity: 0.5 }} />
                            <p style={{ fontSize: "13px", margin: 0, fontWeight: 500 }}>
                                Şu an aktif bir kampanya yok.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .campaign-item-minimal:hover {
          background-color: #f3f4f6 !important;
          border-color: #e5e7eb !important;
        }
        .campaign-modal-body::-webkit-scrollbar {
          width: 4px;
        }
        .campaign-modal-body::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
