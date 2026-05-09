"use client";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { log } from "@/utils/logger";
import apiClient from "@/utils/apiClient";
import { useLangStore } from "@/stores/langStore";
import CircularLoading from "@/components/common/CircularLoading";

const translations = {
  tr: {
    cardInfo: "Kart Bilgileri",
    cardHolderName: "Kart Üzerindeki Ad, Soyad",
    cardNumber: "Kart Numarası",
    expiryDate: "Son Kullanma Tarihi (AA/YY)",
    cvv: "CVV",
    cvvTooltip: "Kartınızın arkasındaki 3 haneli güvenlik numarası",
    installmentOptions: "Taksit Seçenekleri",
    installmentPlaceholder: "Kart numarasının ilk 6 hanesini girdiğinizde taksit seçenekleri burada görünecektir.",
    loadingInstallments: "Taksit seçenekleri yükleniyor...",
    singlePaymentOnly: "Bu kart ile sadece tek çekim yapılabilir.",
    singlePayment: "Tek Çekim",
    installments: "Taksit",
    campaign: "Kampanya",
    locale: "tr-TR"
  },
  en: {
    cardInfo: "Card Information",
    cardHolderName: "Name on Card",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date (MM/YY)",
    cvv: "CVV",
    cvvTooltip: "3-digit security number on the back of your card",
    installmentOptions: "Installment Options",
    installmentPlaceholder: "Installment options will appear here once you enter the first 6 digits of your card number.",
    loadingInstallments: "Loading installment options...",
    singlePaymentOnly: "Only single payment is available with this card.",
    singlePayment: "Single Payment",
    installments: "Installments",
    campaign: "Campaign",
    locale: "en-US"
  }
};

// Kart numarasını 4'lü gruplara formatlar
function formatCardNumber(value) {
  const cleaned = (value || "").replace(/\D/g, "");
  if (cleaned.length <= 16) {
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  }
  return cleaned.slice(0, 16).match(/.{1,4}/g)?.join(" ") || cleaned.slice(0, 16);
}

const PaymentOptions = forwardRef(function PaymentOptions({ cartTotal, onInstallmentChange }, ref) {
  const lang = useLangStore((s) => s.lang);
  const t = translations[lang] || translations.tr;
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
  const lastTotalRef = useRef(null);
  useEffect(() => {
    const fetchInstallmentOptions = async () => {
      const cleanCardNumber = (cardNumber || "").replace(/\s/g, "");
      const bin = cleanCardNumber.length >= 6 ? cleanCardNumber.substring(0, 6) : null;

      if (bin) {
        // Aynı BIN ve aynı tutar için tekrar istek atma
        if (lastBinRef.current === bin && lastTotalRef.current === cartTotal) return;
        lastBinRef.current = bin;
        lastTotalRef.current = cartTotal;
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
              // Mevcut seçili taksiti yeni seçenekler arasında bulmaya çalış
              const currentSelected = selectedInstallment;
              const isStillAvailable = response.data.options.some(
                (o) => o.installment_count === currentSelected && o.is_available
              );

              if (isStillAvailable) {
                setSelectedInstallment(currentSelected);
              } else {
                setSelectedInstallment(response.data.options[0].installment_count);
              }
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

  // Seçili taksit veya seçenekler değiştiğinde parent'ı bilgilendir
  useEffect(() => {
    if (onInstallmentChange) {
      if (installmentOptions.length > 0) {
        const selected = installmentOptions.find(o => o.installment_count === selectedInstallment);
        if (selected) {
          onInstallmentChange({
            count: selected.installment_count,
            total: Number(selected.total_payment),
            isAvailable: selected.is_available
          });
        } else {
          onInstallmentChange(null);
        }
      } else {
        onInstallmentChange(null);
      }
    }
  }, [selectedInstallment, installmentOptions, onInstallmentChange]);

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
            <div className="payment2-card__title">{t.cardInfo}</div>
          </div>
          <div className="payment2-card__body">
            <div className="floating-label-field">
              <input
                className="floating-label-input"
                type="text"
                id="card-holder"
                name="card-holder"
                autoComplete="cc-name"
                placeholder=" "
                value={cardHolderName}
                onChange={(e) => {
                  const value = e.target.value.replace(/\d/g, "");
                  setCardHolderName(value.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US"));
                }}
              />
              <label className="floating-label-text" htmlFor="card-holder">{t.cardHolderName}</label>
            </div>

            <div className="floating-label-field">
              <input
                className="floating-label-input"
                ref={cardNumberInputRef}
                type="text"
                id="card-number"
                name="card-number"
                autoComplete="cc-number"
                placeholder=" "
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
              <label className="floating-label-text" htmlFor="card-number">{t.cardNumber}</label>
            </div>

            <div className="payment2-row">
              <div className="floating-label-field">
                <input
                  className="floating-label-input"
                  type="text"
                  id="expiry-date"
                  name="expiry-date"
                  autoComplete="cc-exp"
                  placeholder=" "
                  value={expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : (expiryMonth || "")}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 4) value = value.slice(0, 4);

                    let month = "";
                    let year = "";

                    if (value.length >= 1) {
                      month = value.slice(0, 2);
                      // Ay 12'den büyükse 12 yap (basit koruma)
                      if (month.length === 2 && parseInt(month) > 12) month = "12";
                      // İlk rakam 1'den büyükse başına 0 ekle (örn: 5 -> 05)
                      if (month.length === 1 && parseInt(month) > 1) month = "0" + month;
                    }

                    if (value.length > 2) {
                      year = value.slice(2, 4);
                    }

                    setExpiryMonth(month);
                    setExpiryYear(year);
                  }}
                  maxLength={5}
                />
                <label className="floating-label-text" htmlFor="expiry-date">{t.expiryDate}</label>
              </div>

              <div className="floating-label-field">
                <input
                  className="floating-label-input"
                  type="text"
                  id="cvv"
                  name="cvv"
                  autoComplete="cc-csc"
                  placeholder=" "
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 3) setCvv(value);
                  }}
                  maxLength={3}
                />
                <label className="floating-label-text" htmlFor="cvv">{t.cvv}</label>
                <div className="cvv-help" title={t.cvvTooltip}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    border: '1.5px solid #8c8c8c',
                    borderRadius: '50%',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    lineHeight: 1
                  }}>?</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sağ: Taksit Seçenekleri (ödeme alanının parçası gibi) */}
        <div className="payment2-card">
          <div className="payment2-card__header">
            <div className="payment2-card__title">{t.installmentOptions}</div>
          </div>
          <div className="payment2-card__body payment2-card__body--tight" style={{ position: 'relative', minHeight: '100px' }}>
            {/* Loading Overlay: Eğer yükleniyorsa ve zaten taksit seçenekleri varsa listenin üzerine göster */}
            {isLoadingInstallments && installmentOptions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                backdropFilter: 'blur(1px)'
              }}>
                <CircularLoading size={30} />
              </div>
            )}

            {cardNumber.replace(/\s/g, "").length < 6 && (
              <div className="payment2-empty">
                {t.installmentPlaceholder}
              </div>
            )}

            {isLoadingInstallments && cardNumber.replace(/\s/g, "").length >= 6 && installmentOptions.length === 0 && (
              <div className="payment2-empty">{t.loadingInstallments}</div>
            )}

            {installmentOptions.length > 0 && (
              <div style={{ opacity: isLoadingInstallments ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                {paymentType === "single" ? (
                  <div className="payment2-empty">{t.singlePaymentOnly}</div>
                ) : (
                  <div className="payment2-installments">

                    {installmentOptions
                      .filter((o) => o.is_available)
                      .map((o) => {
                        const count = o.installment_count;
                        const monthly = Number(o.monthly_payment);
                        const total = Number(o.total_payment);
                        const monthlyText = `${monthly.toLocaleString(t.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
                        const totalText = `${total.toLocaleString(t.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
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
                              {count === 1 ? t.singlePayment : `${count} ${t.installments}`}
                              {o.campaign_applied && campaign && (
                                <span className="payment2-badge">
                                  {campaign.campaign_type_label || campaign.name || t.campaign}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PaymentOptions;
