"use client";
import { useState, useEffect } from "react";
import { log } from "@/utils/logger";
import apiClient from "@/utils/apiClient";

export default function PaymentOptions({ cartTotal }) {
  // Kart bilgileri state'leri
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  // Taksit seçenekleri state'leri
  const [installmentOptions, setInstallmentOptions] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [paymentType, setPaymentType] = useState(null); // "single" veya "installment"
  const [cardType, setCardType] = useState(null); // "credit" veya "debit"
  const [campaign, setCampaign] = useState(null); // Kampanya bilgisi

  // Kart numarası değiştiğinde taksit seçeneklerini getir
  useEffect(() => {
    const fetchInstallmentOptions = async () => {
      // Kart numarasından boşlukları temizle
      const cleanCardNumber = cardNumber.replace(/\s/g, "");

      // İlk 6 haneyi kontrol et
      if (cleanCardNumber.length >= 6) {
        const bin = cleanCardNumber.substring(0, 6);
        const amount = cartTotal.toFixed(2);

        setIsLoadingInstallments(true);
        try {
          const response = await apiClient.get("/installment/options", {
            params: {
              bin: bin,
              amount: amount,
            },
          });

          if (response.data && response.data.success) {
            setInstallmentOptions(response.data.options || []);
            setPaymentType(response.data.payment_type); // "single" veya "installment"
            setCardType(response.data.card_type); // "credit" veya "debit"
            setCampaign(response.data.campaign || null); // Kampanya bilgisi

            // Eğer tek çekim ise (single), otomatik olarak 1 taksit seç
            if (response.data.payment_type === "single") {
              setSelectedInstallment(1);
            } else if (response.data.options && response.data.options.length > 0) {
              // İlk taksit seçeneğini varsayılan olarak seç
              setSelectedInstallment(response.data.options[0].installment_count);
            }
          }
        } catch (error) {
          log("Taksit seçenekleri yüklenirken hata:", error);
          setInstallmentOptions([]);
          setPaymentType(null);
          setCardType(null);
          setCampaign(null);
        } finally {
          setIsLoadingInstallments(false);
        }
      } else {
        // 6 haneden az ise taksit seçeneklerini temizle
        setInstallmentOptions([]);
        setPaymentType(null);
        setCardType(null);
        setCampaign(null);
        setSelectedInstallment(1);
      }
    };

    // Debounce için timeout kullan
    const timeoutId = setTimeout(() => {
      fetchInstallmentOptions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cardNumber, cartTotal]);

  return (
    <div style={{ marginTop: "30px", paddingTop: "30px", borderTop: "1px solid #e5e5e5" }}>
      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#333",
            flexShrink: 0,
          }}
        >
          2
        </div>
        <h5 className="fw-5" style={{ margin: 0 }}>Ödeme Seçenekleri</h5>
      </div>

      {/* İki Sütunlu Layout */}
      <div
        className="payment-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          alignItems: "flex-start",
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .payment-layout {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
              }
            }
          `
        }} />
        {/* Sol Sütun - Kart Formu */}
        <div className="form-checkout">
          <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
            <label htmlFor="card-holder" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#333" }}>
              Kart Üzerindeki İsim
            </label>
            <input
              type="text"
              id="card-holder"
              name="card-holder"
              placeholder="AD SOYAD"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "14px",
                transition: "all 0.3s ease",
                backgroundColor: "#fff",
                textTransform: "uppercase",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3c81b5";
                e.target.style.boxShadow = "0 0 0 3px rgba(60, 129, 181, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e5e5";
                e.target.style.boxShadow = "none";
              }}
            />
          </fieldset>

          <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
            <label htmlFor="card-number" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#333" }}>
              Kart Numarası
            </label>
            <input
              type="text"
              id="card-number"
              name="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/\s/g, "");
                if (value.length <= 16) {
                  value = value.match(/.{1,4}/g)?.join(" ") || value;
                  setCardNumber(value);
                }
              }}
              maxLength={19}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "14px",
                transition: "all 0.3s ease",
                backgroundColor: cardNumber ? "#f0f8ff" : "#fff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3c81b5";
                e.target.style.boxShadow = "0 0 0 3px rgba(60, 129, 181, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e5e5";
                e.target.style.boxShadow = "none";
              }}
            />

          </fieldset>

          <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
            {/* Label'lar tek satırda */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "8px" }}>
              <label htmlFor="expiry-month" style={{ fontSize: "14px", fontWeight: "500", color: "#333", whiteSpace: "nowrap" }}>
                Son Kullanma Tarihi
              </label>
              <label htmlFor="expiry-year" style={{ fontSize: "14px", fontWeight: "500", color: "#333", opacity: 0, pointerEvents: "none" }}>
                &nbsp;
              </label>
              <label htmlFor="cvv" style={{ fontSize: "14px", fontWeight: "500", color: "#333", whiteSpace: "nowrap" }}>
                Güvenlik Kodu
              </label>
            </div>
            {/* Input'lar tek satırda */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
              <select
                id="expiry-month"
                name="expiry-month"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  height: "44px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3c81b5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(60, 129, 181, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e5e5";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Ay</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, "0");
                  return (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  );
                })}
              </select>
              <select
                id="expiry-year"
                name="expiry-year"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  height: "44px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3c81b5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(60, 129, 181, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e5e5";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Yıl</option>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <input
                type="text"
                id="cvv"
                name="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 3) {
                    setCvv(value);
                  }
                }}
                maxLength={3}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  backgroundColor: "#fff",
                  height: "44px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3c81b5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(60, 129, 181, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e5e5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </fieldset>

          {/* Şartlar ve Koşullar */}
          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
              <input
                type="checkbox"
                required
                style={{ marginTop: "3px", cursor: "pointer", flexShrink: 0 }}
              />
              <span>
                Gizlilik Politikasını, Şartlar ve Koşulları ve İade ve Geri Ödeme Politikası okudum, kabul ediyorum.
              </span>
            </label>
          </div>
        </div>

        {/* Sağ Sütun - Taksit Seçenekleri */}
        <div>
          {cardNumber.replace(/\s/g, "").length < 6 && (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px dashed #e5e5e5",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "16px", marginBottom: "8px", color: "#333" }}>💳</div>
              <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                Kart numarasının ilk 6 hanesini girdiğinizde<br />
                taksit seçenekleri burada görünecektir.
              </div>
            </div>
          )}

          {isLoadingInstallments && cardNumber.replace(/\s/g, "").length >= 6 && (
            <div style={{ padding: "20px", textAlign: "center", color: "#666", fontSize: "14px" }}>
              Taksit seçenekleri yükleniyor...
            </div>
          )}

          {!isLoadingInstallments && installmentOptions.length > 0 && (
            <>
              {paymentType === "single" ? (
                <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", fontSize: "14px", color: "#666", textAlign: "center" }}>
                  Bu kart ile sadece tek çekim yapılabilir.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
                    Kartınız {installmentOptions.filter((opt) => opt.is_available).length} taksit için uygundur.
                  </div>
                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      overflow: "hidden",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#333", width: "40px" }}></th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#333" }}>Taksit</th>
                          <th style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#333" }}>Aylık Ödeme</th>
                          <th style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#333" }}>Toplam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installmentOptions
                          .filter((option) => option.is_available)
                          .map((option) => (
                            <tr
                              key={option.installment_count}
                              style={{
                                borderBottom: "1px solid #f0f0f0",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                if (selectedInstallment !== option.installment_count) {
                                  e.currentTarget.style.backgroundColor = "#f9f9f9";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedInstallment !== option.installment_count) {
                                  e.currentTarget.style.backgroundColor = "#fff";
                                }
                              }}
                              onClick={() => setSelectedInstallment(option.installment_count)}
                            >
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <input
                                  type="radio"
                                  name="installment"
                                  value={option.installment_count}
                                  checked={selectedInstallment === option.installment_count}
                                  onChange={() => setSelectedInstallment(option.installment_count)}
                                  style={{ cursor: "pointer" }}
                                />
                              </td>
                              <td style={{ padding: "12px", fontSize: "14px", color: "#333" }}>
                                {option.installment_count === 1 ? "Tek Çekim" : `${option.installment_count} Taksit`}
                                {option.campaign_applied && campaign && (
                                  <span style={{ marginLeft: "6px", fontSize: "12px", color: "#3c81b5", fontWeight: "500" }}>
                                    ({campaign.campaign_type_label || campaign.name || "Kampanya"})
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#333" }}>
                                ₺{parseFloat(option.monthly_payment).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#333", fontWeight: "600" }}>
                                ₺{parseFloat(option.total_payment).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
