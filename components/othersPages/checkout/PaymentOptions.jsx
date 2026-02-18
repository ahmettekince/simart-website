"use client";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { log } from "@/utils/logger";
import apiClient from "@/utils/apiClient";

// Kart numarasını 4'lü gruplara formatlar
function formatCardNumber(value) {
  const cleaned = (value || "").replace(/\D/g, "");
  if (cleaned.length <= 16) {
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  }
  return cleaned.slice(0, 16).match(/.{1,4}/g)?.join(" ") || cleaned.slice(0, 16);
}

const PaymentOptions = forwardRef(function PaymentOptions({ cartTotal }, ref) {
  // Kart bilgileri state'leri
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const cardNumberInputRef = useRef(null);

  // Taksit seçenekleri state'leri
  const [installmentOptions, setInstallmentOptions] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [paymentType, setPaymentType] = useState(null); // "single" veya "installment"
  const [cardType, setCardType] = useState(null); // "credit" veya "debit"
  const [campaign, setCampaign] = useState(null); // Kampanya bilgisi

  // Kart numarası değiştiğinde taksit seçeneklerini getir (ilk 6 hane = BIN; autofill 16 hane getirdiğinde de çalışır)
  const lastBinRef = useRef(null);
  useEffect(() => {
    const fetchInstallmentOptions = async () => {
      const cleanCardNumber = (cardNumber || "").replace(/\s/g, "");
      const bin = cleanCardNumber.length >= 6 ? cleanCardNumber.substring(0, 6) : null;

      if (bin) {
        // Aynı BIN için tekrar istek atma
        if (lastBinRef.current === bin) return;
        lastBinRef.current = bin;
        const amount = cartTotal.toFixed(2);
        setIsLoadingInstallments(true);
        try {
          const response = await apiClient.get("/installment/options", {
            params: { bin, amount },
          });
          if (response.data && response.data.success) {
            setInstallmentOptions(response.data.options || []);
            setPaymentType(response.data.payment_type);
            setCardType(response.data.card_type);
            setCampaign(response.data.campaign || null);
            if (response.data.payment_type === "single") {
              setSelectedInstallment(1);
            } else if (response.data.options?.length > 0) {
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
        lastBinRef.current = null;
        setInstallmentOptions([]);
        setPaymentType(null);
        setCardType(null);
        setCampaign(null);
        setSelectedInstallment(1);
      }
    };

    const timeoutId = setTimeout(fetchInstallmentOptions, 400);
    return () => clearTimeout(timeoutId);
  }, [cardNumber, cartTotal]);

  // Autofill: input uncontrolled; değeri periyodik + focus'ta okuyup state'e yazıyoruz (taksit isteği tetiklensin)
  const syncCardNumberFromInput = () => {
    const el = cardNumberInputRef.current;
    if (!el) return;
    const raw = (el.value || "").replace(/\D/g, "");
    if (raw.length >= 6) {
      const formatted = formatCardNumber(el.value);
      setCardNumber((prev) => {
        const prevClean = (prev || "").replace(/\s/g, "");
        return prevClean === raw ? prev : formatted;
      });
    }
  };
  useEffect(() => {
    const POLL_INTERVAL = 200;
    const POLL_DURATION = 6000;
    let elapsed = 0;
    const t = setInterval(() => {
      syncCardNumberFromInput();
      elapsed += POLL_INTERVAL;
      if (elapsed >= POLL_DURATION) clearInterval(t);
    }, POLL_INTERVAL);
    const t1 = setTimeout(syncCardNumberFromInput, 0);
    const t2 = setTimeout(syncCardNumberFromInput, 300);
    const t3 = setTimeout(syncCardNumberFromInput, 800);
    return () => {
      clearInterval(t);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Parent component'ten form verilerini almak için expose et (kart numarası her zaman input'tan okunur, autofill dahil)
  useImperativeHandle(ref, () => ({
    getPaymentData: () => {
      const rawCardNumber = (cardNumberInputRef.current?.value || cardNumber || "").replace(/\s/g, "");
      let formattedYear = expiryYear;
      if (expiryYear && expiryYear.length === 4) {
        formattedYear = expiryYear.substring(2);
      }

      return {
        card_holder_name: cardHolderName,
        card_number: rawCardNumber,
        expiry_month: expiryMonth,
        expiry_year: formattedYear,
        cvv: cvv,
        installment_count: selectedInstallment,
      };
    },
  }));

  return (
    <div className="payment2" style={{ marginTop: "24px", marginBottom: "24px" }}>
      <div className="payment2-grid">
        {/* Sol: Kart Bilgileri */}
        <div className="payment2-card">
          <div className="payment2-card__header">
            <div className="payment2-card__title">Kart Bilgileri</div>
          </div>
          <div className="payment2-card__body">
            <div className="payment2-field">
              <label className="payment2-label" htmlFor="card-holder">Kart Üzerindeki İsim</label>
              <input
                className="payment2-input"
                type="text"
                id="card-holder"
                name="card-holder"
                autoComplete="cc-name"
                placeholder="AD SOYAD"
                value={cardHolderName}
                onChange={(e) => {
                  const value = e.target.value.replace(/\d/g, "");
                  setCardHolderName(value.toUpperCase());
                }}
              />
            </div>

            <div className="payment2-field">
              <label className="payment2-label" htmlFor="card-number">Kart Numarası</label>
              <input
                className="payment2-input"
                ref={cardNumberInputRef}
                type="text"
                id="card-number"
                name="card-number"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                defaultValue=""
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 16) {
                    value = value.match(/.{1,4}/g)?.join(" ") || value;
                    e.target.value = value;
                    setCardNumber(value);
                  }
                }}
                onBlur={(e) => {
                  const raw = (e.target.value || "").replace(/\D/g, "");
                  if (raw.length >= 6) {
                    const formatted = formatCardNumber(e.target.value);
                    setCardNumber((prev) => {
                      const prevClean = (prev || "").replace(/\s/g, "");
                      return prevClean === raw ? prev : formatted;
                    });
                  }
                }}
                onFocus={() => requestAnimationFrame(() => syncCardNumberFromInput())}
                maxLength={19}
              />
            </div>

            <div className="payment2-row">
              <div className="payment2-field">
                <label className="payment2-label">Son Kullanma Tarihi</label>
                <div className="payment2-exp">
                  <select
                    className="payment2-select"
                    id="expiry-month"
                    name="expiry-month"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    autoComplete="cc-exp-month"
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
                    className="payment2-select"
                    id="expiry-year"
                    name="expiry-year"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    autoComplete="cc-exp-year"
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
                </div>
              </div>

              <div className="payment2-field">
                <label className="payment2-label" htmlFor="cvv">CVV</label>
                <input
                  className="payment2-input payment2-input--cvv"
                  type="text"
                  id="cvv"
                  name="cvv"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 3) setCvv(value);
                  }}
                  maxLength={3}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Sağ: Taksit Seçenekleri (ödeme alanının parçası gibi) */}
        <div className="payment2-card">
          <div className="payment2-card__header">
            <div className="payment2-card__title">Taksit Seçenekleri</div>
          </div>
          <div className="payment2-card__body payment2-card__body--tight">
            {cardNumber.replace(/\s/g, "").length < 6 && (
              <div className="payment2-empty">
                Kart numarasının ilk 6 hanesini girdiğinizde taksit seçenekleri burada görünecektir.
              </div>
            )}

            {isLoadingInstallments && cardNumber.replace(/\s/g, "").length >= 6 && (
              <div className="payment2-empty">Taksit seçenekleri yükleniyor...</div>
            )}

            {!isLoadingInstallments && installmentOptions.length > 0 && (
              <>
                {paymentType === "single" ? (
                  <div className="payment2-empty">Bu kart ile sadece tek çekim yapılabilir.</div>
                ) : (
                  <div className="payment2-installments">

                    {installmentOptions
                      .filter((o) => o.is_available)
                      .map((o) => {
                        const count = o.installment_count;
                        const monthly = Number(o.monthly_payment);
                        const total = Number(o.total_payment);
                        const monthlyText = `${monthly.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
                        const totalText = `${total.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
                        return (
                          <label
                            key={count}
                            className={`payment2-installment ${selectedInstallment === count ? "is-selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="installment"
                              value={count}
                              checked={selectedInstallment === count}
                              onChange={() => setSelectedInstallment(count)}
                            />
                            <span className="payment2-installment__left">
                              {count === 1 ? "Tek Çekim" : `${count} Taksit`}
                              {o.campaign_applied && campaign && (
                                <span className="payment2-badge">
                                  {campaign.campaign_type_label || campaign.name || "Kampanya"}
                                </span>
                              )}
                            </span>
                            <span className="payment2-installment__mid ta-right">{count === 1 ? "" : `${count} x ${monthlyText}`}</span>
                            <span className="payment2-installment__right ta-right">{count === 1 ? "" : totalText}</span>
                          </label>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PaymentOptions;
