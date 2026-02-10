"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Session Storage'dan veriyi oku (Ara sayfadan gelen)
    const storedData = sessionStorage.getItem("payment_result_storage");

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setResultData(parsed);
        // İsteğe bağlı: Veriyi okuduktan sonra silmek isterseniz:
        // sessionStorage.removeItem("payment_result_storage");
      } catch (e) {
        console.error("Parse error", e);
      }
    } else {
      // Fallback: Eğer session boşsa, belki URL parametreleri vardır (eski usul)
      const params = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      if (Object.keys(params).length > 0) {
        setResultData(params);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
        <p className="mt-3">Sonuç alınıyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Ödeme Sonucu</div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "30px", marginBottom: "50px" }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {resultData ? (
              <div style={{
                backgroundColor: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "1px solid #eee"
              }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                  {/* Basit bir ikon (Başarılı/Başarısız durumuna göre değişebilir) */}
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: resultData.status === 'success' || resultData.MdStatus === '1' ? "#e8f5e9" : "#fff3e0",
                    color: resultData.status === 'success' || resultData.MdStatus === '1' ? "#2e7d32" : "#ef6c00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px",
                    fontSize: "30px"
                  }}>
                    {resultData.status === 'success' || resultData.MdStatus === '1' ? '✓' : '!'}
                  </div>
                  <h3 style={{ marginBottom: "10px" }}>İşlem Sonucu Alındı</h3>
                  <p style={{ color: "#666" }}>Ödeme sağlayıcısından dönen sonuç detayları aşağıdadır.</p>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered table-striped" style={{ fontSize: "14px" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "35%" }}>Parametre</th>
                        <th>Değer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(resultData).map(([key, value]) => (
                        <tr key={key}>
                          <td style={{ fontWeight: "600", color: "#555" }}>{key}</td>
                          <td style={{ wordBreak: "break-all" }}>{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "30px", textAlign: "center" }}>
                  <Link href="/" className="tf-btn btn-fill radius-3 animate-hover-btn">
                    Ana Sayfaya Dön
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h4>Sonuç Bulunamadı</h4>
                <p>Ödeme sonucu görüntülenemedi veya geçersiz bir işlem yapıldı.</p>
                <Link href="/" className="tf-btn btn-line mt-3">Ana Sayfaya Dön</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
