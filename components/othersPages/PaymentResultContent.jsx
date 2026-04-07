"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, notFound } from "next/navigation";
import Cookies from "js-cookie";
import { log } from "@/utils/logger";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function PaymentResultContent() {
  const { lang } = useLangStore();
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = {
    tr: {
      loading: "Yükleniyor...",
      checking: "Sonuç kontrol ediliyor...",
      successTitle: "Siparişiniz Tamamlandı!",
      failTitle: "Siparişiniz Tamamlanamadı",
      successDefaultMsg: "Ödeme işleminiz başarıyla gerçekleşti.",
      failDefaultMsg: "Ödeme işlemi sırasında bir hata oluştu.",
      orderNumber: "Sipariş Numarası",
      backToHome: "Ana Sayfaya Dön",
      viewOrders: "Siparişlerimi Görüntüle",
      tryAgain: "Tekrar Dene"
    },
    en: {
      loading: "Loading...",
      checking: "Checking the result...",
      successTitle: "Your Order is Complete!",
      failTitle: "Your Order Could Not Be Completed",
      successDefaultMsg: "Your payment has been successfully processed.",
      failDefaultMsg: "An error occurred during the payment process.",
      orderNumber: "Order Number",
      backToHome: "Back to Home",
      viewOrders: "View My Orders",
      tryAgain: "Try Again"
    }
  }[lang] || {
    tr: {
      loading: "Yükleniyor...",
      checking: "Sonuç kontrol ediliyor...",
      successTitle: "Siparişiniz Tamamlandı!",
      failTitle: "Siparişiniz Tamamlanamadı",
      successDefaultMsg: "Ödeme işleminiz başarıyla gerçekleşti.",
      failDefaultMsg: "Ödeme işlemi sırasında bir hata oluştu.",
      orderNumber: "Sipariş Numarası",
      backToHome: "Ana Sayfaya Dön",
      viewOrders: "Siparişlerimi Görüntüle",
      tryAgain: "Tekrar Dene"
    }
  }.tr;

  useEffect(() => {
    const storedData = sessionStorage.getItem("payment_result_storage");

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setResultData(parsed);
      } catch (e) {
        console.error("Parse error", e);
      }
      setLoading(false);
    } else {
      const params = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      if (Object.keys(params).length > 0) {
        setResultData(params);
        setLoading(false);
      } else {
        notFound();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!resultData || typeof window === 'undefined') return;

    const { trackPurchase, trackPurchaseFailure } = require("@/utils/analytics");
    const pendingData = sessionStorage.getItem('pending_purchase');
    let orderData = null;

    if (pendingData) {
      try {
        orderData = JSON.parse(pendingData);
      } catch (e) {
        console.error("Pending purchase data parse error", e);
      }
    }

    if (resultData.status === 'success') {
      Cookies.remove("affiliate_ref");

      if (orderData) {
        if (resultData.order_number || resultData.OrderId) {
          orderData.id = resultData.order_number || resultData.OrderId;
        }

        trackPurchase(orderData);
        log('GTM Purchase tracked from PaymentResultContent:', orderData);
        sessionStorage.removeItem('pending_purchase');
      }
    } else {
      const errorMsg = resultData.bank_code_message || resultData.message || t.failDefaultMsg;
      const orderId = resultData.order_number || resultData.OrderId || (orderData ? orderData.id : null);

      trackPurchaseFailure(errorMsg, orderId);
      log('GTM Purchase Failure tracked:', errorMsg);
    }
  }, [resultData, t.failDefaultMsg]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t.loading}</span>
        </div>
        <p className="mt-3 text-secondary">{t.checking}</p>
      </div>
    );
  }

  if (!resultData) return null;

  const isSuccess = resultData?.status === 'success';
  const displayMessage = resultData?.bank_code_message || resultData?.message || (isSuccess ? t.successDefaultMsg : t.failDefaultMsg);
  const orderNumber = resultData?.order_number || resultData?.OrderId || "-";

  return (
    <>
      <div className="container" style={{ marginTop: "30px", marginBottom: "80px" }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div style={{
              backgroundColor: "#fff",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              border: "1px solid #f0f0f0",
              textAlign: "center"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: isSuccess ? "linear-gradient(135deg, #4CAF50 0%, #43A047 100%)" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 25px",
                fontSize: "40px",
                boxShadow: isSuccess ? "0 4px 15px rgba(76, 175, 80, 0.3)" : "0 4px 15px rgba(229, 57, 53, 0.3)"
              }}>
                <i className={isSuccess ? "icon-check" : "icon-close"}></i>
              </div>

              <h2 style={{ marginBottom: "15px", color: "#333", fontWeight: "700" }}>
                {isSuccess ? t.successTitle : t.failTitle}
              </h2>

              <p
                style={{ color: "#666", fontSize: "16px", lineHeight: "1.6", marginBottom: "30px", maxWidth: "80%", margin: "0 auto 30px" }}
                dangerouslySetInnerHTML={{ __html: displayMessage }}
              />

              {orderNumber !== "-" && (
                <div style={{
                  background: "#f8f9fa",
                  padding: "15px 25px",
                  borderRadius: "8px",
                  display: "inline-block",
                  marginBottom: "35px",
                  border: "1px dashed #ced4da"
                }}>
                  <span style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {t.orderNumber}
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: "bold", color: "#333", fontFamily: "monospace" }}>
                    {orderNumber}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href={getLocalizedUrl("/", lang)} className="tf-btn btn-fill radius-3 animate-hover-btn">
                  {t.backToHome}
                </Link>
                {isSuccess && (
                  <Link href={getLocalizedUrl("/siparislerim", lang)} className="tf-btn btn-line radius-3">
                    {t.viewOrders}
                  </Link>
                )}
                {!isSuccess && (
                  <Link href={getLocalizedUrl("/odeme", lang)} className="tf-btn btn-line radius-3">
                    {t.tryAgain}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
