"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import Link from "next/link";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

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
        setError("Kuponlarınız yüklenirken bir hata oluştu.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCoupons();
    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Tarih kısmı: 17 Mart 2026
      const datePart = date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      // Saat kısmı: 14:30
      // Eğer backend sadece YYYY-MM-DD dönüyorsa saat 00:00 olur, bu durumda saati göstermemek daha mantıklı olabilir.
      // Ancak istek "saat gibi yapalım" olduğu için saati ekliyoruz.
      // Eğer tarih string'i saat içermiyorsa kontrol edilebilir.
      const timePart = date.toLocaleTimeString("tr-TR", {
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

  return (
    <div className="my-account-content account-coupons">
      {loading && (
        <div style={{ padding: "16px", textAlign: "center" }}>
          Kuponlarınız yükleniyor...
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
            Henüz tanımlı bir kuponunuz bulunmuyor.
          </div>
          <div className="col-lg-3 col-md-6">
            <Link
              href="/magaza"
              className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
            >
              Alışverişe Başla
            </Link>
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
                        {coupon.description || "Sepette otomatik uygulanır."}
                      </p>
                    </div>

                    <div className="valid-date">
                      {coupon.end_date ? (
                        <span>Geçerlilik: {formatDate(coupon.end_date)}</span>
                      ) : (
                        <span>Süresiz</span>
                      )}
                      {coupon.min_cart_amount && (
                        <div style={{ marginTop: '2px' }}>Minimum Sepet Tutarı: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{Number(coupon.min_cart_amount).toLocaleString("tr-TR")} TL</span></div>
                      )}
                    </div>
                  </div>

                  <div
                    className="ticket-right"
                    onClick={() => isUsable && handleCopy(coupon.code, coupon.id)}
                    style={{ cursor: isUsable ? 'pointer' : 'default' }}
                    title={isUsable ? "Kodu Kopyala" : ""}
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
                          Kopyalandı!
                        </span>
                      )}
                      {!isCopied && isUsable && (
                        <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>Kopyala</span>
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

