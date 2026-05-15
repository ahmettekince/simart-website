import React from "react";

export default function HomeSeoText({ lang = "tr" }) {
  if (lang !== "tr") return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Şımart Teknoloji'de hangi ürünleri bulabilirsiniz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Şımart Teknoloji; yerli üretim robot süpürge (katya), hava temizleyici ve cam silme robotu gibi yenilikçi akıllı ev sistemleri sunmaktadır."
        }
      },
      {
        "@type": "Question",
        "name": "katya robot süpürge serisi özellikleri nelerdir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "katya robot süpürge serisi; yüksek emiş gücü ve akıllı haritalama teknolojisine sahiptir."
        }
      },
      {
        "@type": "Question",
        "name": "Şımart Teknoloji teknik servis hizmeti nasıldır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tüm Şımart ürünleri, 48 saatte çözüm garantili teknik servis hizmeti güvencesiyle sunulmaktadır."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="flat-spacing-1">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="fw-7 mb-20" style={{ fontSize: '24px' }}>
                Akıllı Ev Sistemleri ve Robot Süpürge Tercihinde Türkiye'nin Güvenilir Adresi: Şımart Teknoloji
              </h2>
              <p className="text-secondary" style={{ lineHeight: '1.8' }}>
                Şımart Teknoloji olarak, yaşam alanlarınızı daha temiz ve daha konforlu hale getirmek için tasarlanmış yenilikçi <strong>akıllı ev sistemleri</strong> sunuyoruz.
                <strong> katya</strong> adını verdiğimiz, yerli üretim <strong>robot süpürge</strong> modellerimiz; yüksek emiş gücü, akıllı haritalama teknolojisi ve ıslak-kuru silme özelliğiyle evinizi siz yorulmadan temiz tutar.
                Kapalı alanlardaki toz, alerjen ve zararlı partikülleri etkili bir şekilde filtreleyen <strong>hava temizleyici</strong> ürünlerimiz, ailenizin her nefesini koruyan sağlıklı bir iç mekan ortamı sağlar.
                <strong> Cam silme robotumuz</strong> ile zorlu ve yüksek noktalardaki camları artık riske girmeden temizleyebilirsiniz.
                Tüm ürünlerimiz, 48 saatte çözüm garantili teknik servis hizmeti güvencesiyle birlikte gelir.
                Şımart <strong>akıllı ev sistemleri</strong> ile ev temizliğini teknolojiyle yeniden keşfedin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
