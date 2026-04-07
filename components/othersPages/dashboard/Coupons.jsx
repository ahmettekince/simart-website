"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import Link from "next/link";
import SimartButton from "@/components/common/SimartButton";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function Coupons() {
  const lang = useLangStore((s) => s.lang);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const t = {
    tr: {
      loading: "Kuponlarınız yükleniyor...",
      error: "Kuponlarınız yüklenirken bir hata oluştu.",
      noCoupons: "Henüz tanımlı bir kuponunuz bulunmuyor.",
      startShopping: "Alışverişe Başla",
      autoApplied: "Sepette otomatik uygulanır.",
      validity: "Geçerlilik",
      unlimited: "Süresiz",
      minCartAmount: "Minimum Sepet Tutarı",
      copyCode: "Kodu Kopyala",
      copied: "Kopyalandı!",
      copy: "Kopyala"
    },
    en: {
      loading: "Loading your coupons...",
      error: "An error occurred while loading your coupons.",
      noCoupons: "You don't have any defined coupons yet.",
      startShopping: "Start Shopping",
      autoApplied: "Automatically applied in cart.",
      validity: "Validity",
      unlimited: "Unlimited",
      minCartAmount: "Minimum Cart Amount",
      copyCode: "Copy Code",
      copied: "Copied!",
      copy: "Copy"
    }
  }[lang] || {};

  useEffect(() => {
    let mounted = true;

    const fetchCoupons = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/customer/coupons");
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (!mounted) return;

        // Kullanılabilirleri üste al
        const sorted = [...data].sort((a, b) => {
          if (a.status === "usable" && b.status !== "usable") return -1;
          if (a.status !== "usable" && b.status === "usable") return 1;
          return (b.created_at || "").localeCompare(a.created_at || "");
        });

        setCoupons(sorted);
      } catch (e) {
        if (!mounted) return;
        setError(t.error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCoupons();
    return () => {
      mounted = false;
    };
  }, [lang, t.error]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const isEn = lang === "en";
      const locale = isEn ? "en-US" : "tr-TR";
      
      const datePart = date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      
      const timePart = date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${datePart} - ${timePart}`;
    } catch (e) {
      return dateString;
    }
  };

  const handleCopy = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  const isEn = lang === "en";

  return (
    <div className="my-account-content account-coupons">
      {loading && (
        <div style={{ padding: "16px", textAlign: "center" }}>
          {t.loading}
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: "16px", textAlign: "center", color: "#dc3545" }}>
          {error}
        </div>
      )}

      {!loading && !error && coupons.length === 0 && (
        <div className="row align-items-center w-100" style={{ rowGap: 20 }}>
          <div className="col-lg-4 col-md-6 fs-18">
            {t.noCoupons}
          </div>
          <div className="col-lg-3 col-md-6">
            <SimartButton
              href={getLocalizedUrl("/magaza", lang)}
              fullWidth
            >
              {t.startShopping}
            </SimartButton>
          </div>
        </div>
      )}

      {!loading && !error && coupons.length > 0 && (
        <div className="row">
          {coupons.map((coupon) => {
            const isUsable = coupon.status === "usable";
            const isCopied = copiedId === coupon.id;

            return (
              <div key={coupon.id} className="col-md-6 col-12 mb-3">
                <div className={`coupon-ticket ${!isUsable ? 'disabled' : ''}`}>
                  <div className="ticket-left">
                    <div className="d-flex flex-column">
                      <h5 className="coupon-title">{coupon.name}</h5>
                      <p className="mb-0 text-muted" style={{ fontSize: '13px', lineHeight: '1.4', marginTop: '4px' }}>
                        {coupon.description || t.autoApplied}
                      </p>
                    </div>

                    <div className="valid-date">
                      {coupon.end_date ? (
                        <span>{t.validity}: {formatDate(coupon.end_date)}</span>
                      ) : (
                        <span>{t.unlimited}</span>
                      )}
                      {coupon.min_cart_amount && (
                        <div style={{ marginTop: '2px' }}>{t.minCartAmount}: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{Number(coupon.min_cart_amount).toLocaleString(isEn ? "en-US" : "tr-TR")} {isEn ? "TL" : "TL"}</span></div>
                      )}
                    </div>
                  </div>

                  <div
                    className="ticket-right"
                    onClick={() => isUsable && handleCopy(coupon.code, coupon.id)}
                    style={{ cursor: isUsable ? 'pointer' : 'default' }}
                    title={isUsable ? t.copyCode : ""}
                  >
                    <div className="status-badge" style={{
                      background: isUsable ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      color: '#fff'
                    }}>
                      {coupon.status_label || coupon.status}
                    </div>

                    <div className="discount-val">
                      {coupon.discount_label}
                    </div>

                    <div className="coupon-code mt-2 d-flex flex-column align-items-center">
                      <span style={{ opacity: isCopied ? 0.5 : 1, transition: '0.2s' }}>{coupon.code}</span>
                      {isCopied && (
                        <span style={{
                          fontSize: '10px',
                          background: '#fff',
                          color: '#3c81b5',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          position: 'absolute',
                          bottom: '10px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {t.copied}
                        </span>
                      )}
                      {!isCopied && isUsable && (
                        <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>{t.copy}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

