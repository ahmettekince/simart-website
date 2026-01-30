"use client";
import Header from "@/components/headers/Header";
import React, { useEffect, useState, Suspense } from "react";

// Gelen POST isteklerini ekrana ve konsola PHP'deki print_r($_POST) gibi göstermek için SSR kullanmalıyız.
// Next.js 'page.jsx' dosyası sadece GET için client component'tır, ancak Next.js 13+ ile server actions veya API route ile post datayı SSR'da gösterebiliriz.
// Burada bir çözüm olarak, post edilen veriyi backend'de bir query string olarak başarılı sayfaya yönlendirdiğimiz için (route.js dosyasında), 
// odeme-sonuc/page.jsx'e gelen veriler query parametrelerinde olacak. 
// Ancak gerçek POST'u görmek isterseniz, bu bilgiler route.js dosyasından alınmalıdır, 
// ve burada ekrana ve konsola tam içeriği basıyoruz.

import { useSearchParams } from "next/navigation";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [postData, setPostData] = useState({});

  useEffect(() => {
    // Tüm query parametrelerini al (backend POST'u query olarak yönlendiriyor)
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setPostData(params);

    // Konsola tıpkı PHP print_r gibi bas
    console.log("========== ODENE SONUC POST VERISI ==========");
    console.log(params); // Geliştirici daha kolay görsün diye obje basıyoruz
    try {
      // print_r karşılığı gibi
      console.log(JSON.stringify(params, null, 2));
    } catch (e) { }
    console.log("==============================================");
  }, [searchParams]);

  return (
    <>
      <Header />
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

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <>
        <div className="tf-page-title">
          <div className="container-full">
            <div className="heading text-center">Ödeme Sonucu</div>
          </div>
        </div>
        <div className="container" style={{ marginTop: "30px", textAlign: "center" }}>
          <p>Yükleniyor...</p>
        </div>
      </>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
