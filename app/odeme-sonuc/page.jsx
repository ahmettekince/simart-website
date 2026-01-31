import Header from "@/components/headers/Header";
import React, { Suspense } from "react";
import PaymentResultContent from "@/components/othersPages/PaymentResultContent";

// Gelen POST isteklerini ekrana ve konsola PHP'deki print_r($_POST) gibi göstermek için SSR kullanmalıyız.
// Next.js 'page.jsx' dosyası sadece GET için client component'tır, ancak Next.js 13+ ile server actions veya API route ile post datayı SSR'da gösterebiliriz.
// Burada bir çözüm olarak, post edilen veriyi backend'de bir query string olarak başarılı sayfaya yönlendirdiğimiz için (route.js dosyasında), 
// odeme-sonuc/page.jsx'e gelen veriler query parametrelerinde olacak. 
// Ancak gerçek POST'u görmek isterseniz, bu bilgiler route.js dosyasından alınmalıdır, 
// ve burada ekrana ve konsola tam içeriği basıyoruz.

export default function PaymentResultPage() {
  return (
    <>
      <Header />
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
    </>
  );
}
