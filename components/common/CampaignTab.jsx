"use client";

import React, { useState, useEffect } from "react";
import { Ticket, X } from "lucide-react";
import CampaignModal from "../modals/CampaignModal";

export default function CampaignTab() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const closed = sessionStorage.getItem("campaign-tab-closed");
        if (closed) {
            setIsVisible(false);
        }
    }, []);

    const handleCloseTab = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        sessionStorage.setItem("campaign-tab-closed", "true");
    };

    if (!isVisible) return null;

    return (
        <>
            <div
                className="campaign-tab-wrapper"
                style={{
                    position: "fixed",
                    right: 0,
                    top: "50%",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                }}
            >
                {/* Kapatma Butonu */}
                <button
                    onClick={handleCloseTab}
                    style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        marginBottom: "-8px",
                        marginRight: "4px",
                        zIndex: 10000,
                        color: "#9ca3af",
                        padding: 0,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}
                    title="Kapat"
                >
                    <X size={12} />
                </button>

                {/* Tab (Kulakçık) */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        backgroundColor: "#3c81b5",
                        color: "#fff",
                        padding: "16px 10px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                        borderRadius: "12px 0 0 12px",
                        boxShadow: "-4px 0 20px rgba(60, 129, 181, 0.2)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        userSelect: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRight: "none"
                    }}
                    className="campaign-tab-main"
                >

                    <span style={{
                        writingMode: "vertical-rl",
                        fontSize: "13px",
                        fontWeight: 700,

                    }}>
                        KAMPANYALAR
                    </span>
                </div>
            </div>

            <CampaignModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <style jsx>{`
                .campaign-tab-main:hover {
                  padding-right: 14px !important;
                  background-color: #34709d !important;
                }
                @media (max-width: 768px) {
                    .campaign-tab-wrapper {
                        top: 55% !important;
                    }
                    .campaign-tab-main {
                        padding: 12px 8px !important;
                    }
                }
            `}</style>
        </>
    );
}

