"use client"
import React from "react";
import ReactDOM from "react-dom";
import Image from "next/image";

/**
 * Hediye seçim modali
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - campaigns: selectable_gift_campaigns dizisi
 * - selectedGiftId: number | null
 * - onChangeSelected: (giftProduct) => void
 * - onConfirm: () => void
 */
export default function GiftSelectionModal({
  open,
  onClose,
  campaigns = [],
  selectedGiftId,
  onChangeSelected,
  onConfirm,
}) {
  if (!open || !campaigns || campaigns.length === 0) return null;

  // SSR / document yoksa render etme
  if (typeof document === "undefined") return null;

  // Kampanyalardaki tüm hediye ürünleri flatten et
  const giftProducts = campaigns.flatMap((campaign) =>
    (campaign.selectable_gift_products || []).map((gift) => ({
      ...gift,
      _campaignId: campaign.id,
      _campaignName: campaign.name,
    }))
  );

  if (giftProducts.length === 0) return null;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          backgroundColor: "#fff",
          borderRadius: "18px",
          padding: "22px 20px 18px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.28)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Hediye Seç</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 4,
              marginRight: -4,
              color: "#666",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* Açıklama */}
        <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "14px" }}>
          Bu ürün <strong>hediyelidir</strong>. Lütfen sepete eklemeden önce kampanyadan
          kullanmak istediğiniz hediyeyi seçin.
        </div>

        {/* Liste */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "4px",
            marginRight: "-4px",
          }}
        >
          {giftProducts.map((gift) => {
            const imageUrl =
              gift.cover_image?.thumbnail_url ||
              gift.cover_image?.url ||
              "/images/placeholder.jpg";

            const isSelected = selectedGiftId === gift.id;
            const price =
              gift.final_price != null ? gift.final_price : gift.price || 0;

            return (
              <label
                key={`${gift._campaignId}-${gift.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 10px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid #16a34a" : "1px solid #e5e7eb",
                  marginBottom: "8px",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#f0fdf4" : "#fff",
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                }}
                onClick={() => onChangeSelected?.(gift)}
              >
                <input
                  type="radio"
                  name="gift-product"
                  checked={isSelected}
                  onChange={() => onChangeSelected?.(gift)}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={gift.name || "Hediye ürün"}
                    width={128}
                    height={128}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {gift._campaignName && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#16a34a",
                        marginBottom: 2,
                        fontWeight: 600,
                      }}
                    >
                      {gift._campaignName}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {gift.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    Hediye ürün ·{" "}
                    <span style={{ fontWeight: 600 }}>
                      ₺{Number(price || 0).toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "999px",
                    border: isSelected ? "6px solid #16a34a" : "2px solid #d1d5db",
                    boxSizing: "border-box",
                    flexShrink: 0,
                  }}
                />
              </label>
            );
          })}
        </div>

        {/* Butonlar */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "14px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedGiftId}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: selectedGiftId ? "#16a34a" : "#9ca3af",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              cursor: selectedGiftId ? "pointer" : "not-allowed",
              boxShadow: selectedGiftId
                ? "0 10px 20px rgba(22,163,74,0.25)"
                : "none",
              transition: "background-color 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );

  // Kartın içinde değil, doğrudan body içinde render et
  return ReactDOM.createPortal(modalContent, document.body);
}

