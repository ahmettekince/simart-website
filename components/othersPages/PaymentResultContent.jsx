"use client";
import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentResultContent() {
  const searchParams = useSearchParams();

  const postData = useMemo(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  useEffect(() => {
    // Konsola tıpkı PHP print_r gibi bas
    console.log("========== ODEME SONUC POST VERISI ==========");
    console.log(postData); // Geliştirici daha kolay görsün diye obje basıyoruz
    try {
      // print_r karşılığı gibi
      console.log(JSON.stringify(postData, null, 2));
    } catch (e) { }
    console.log("==============================================");
  }, [postData]);

  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Ödeme Sonucu</div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "30px", marginBottom: "30px" }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <div style={{
              backgroundColor: "#d4edda",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #c3e6cb",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              <h2 style={{ color: "#155724", marginBottom: "10px" }}>
                Post verisi alındı!
              </h2>
              <p style={{ color: "#155724", fontSize: "16px" }}>
                Aşağıda ödeme altyapısından gelen POST verisini görebilirsin.
              </p>
              <p style={{ color: "#155724", fontSize: "14px", marginTop: 10 }}>
                <b>Not:</b> Konsolu (F12) açarsan PHP <code>print_r($_POST);</code> gibi detaylı görebilirsin!
              </p>
            </div>
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              marginBottom: "20px"
            }}>
              <h5 style={{ marginBottom: "15px", color: "#495057" }}>
                📥 POST ile gelen veriler:
              </h5>
              {Object.keys(postData).length > 0 ? (
                <pre
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#222",
                    color: "#0f0",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap"
                  }}
                >{JSON.stringify(postData, null, 2)}</pre>
              ) : (
                <div style={{
                  color: "#6c757d",
                  fontStyle: "italic",
                  padding: "30px",
                  textAlign: "center"
                }}>
                  Henüz POST verisi yok. <br /> Ödeme altyapısından gelen POST isteği buraya düşecektir.
                </div>
              )}
              <div style={{
                marginTop: "15px",
                color: "#495057",
                fontSize: "12px"
              }}>
                <b>Konsolu açmayı unutma! Tüm post detayları F12 Console'da da yazıyor (PHP print_r gibi)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
