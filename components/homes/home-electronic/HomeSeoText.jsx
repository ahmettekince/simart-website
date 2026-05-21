import React from "react";



export default function HomeSeoText({ lang = "tr" }) {
  if (lang !== "tr") return null;



  return (
    <>
      <section className="flat-spacing-1">

        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="fw-7 mb-20" style={{ fontSize: '24px' }}>
                Akıllı Ev Sistemleri ve Robot Süpürge Tercihinde Türkiye'nin Güvenilir Adresi: Şımart Teknoloji
              </h2>
              <p className="text-secondary" style={{ lineHeight: '1.8' }}>
                Şımart Teknoloji olarak, yaşam alanlarınızı daha temiz ve daha konforlu hale getirmek için tasarlanmış yenilikçi akıllı ev sistemleri sunuyoruz.
                katya adını verdiğimiz, yerli üretim robot süpürge modellerimiz; yüksek emiş gücü, akıllı haritalama teknolojisi ve ıslak-kuru silme özelliğiyle evinizi siz yorulmadan temiz tutar.
                Kapalı alanlardaki toz, alerjen ve zararlı partikülleri etkili bir şekilde filtreleyen hava temizleyici ürünlerimiz, ailenizin her nefesini koruyan sağlıklı bir iç mekan ortamı sağlar.
                Cam silme robotumuz ile zorlu ve yüksek noktalardaki camları artık riske girmeden temizleyebilirsiniz.
                Tüm ürünlerimiz, 48 saatte çözüm garantili teknik servis hizmeti güvencesiyle birlikte gelir.
                Şımart akıllı ev sistemleri ile ev temizliğini teknolojiyle yeniden keşfedin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
