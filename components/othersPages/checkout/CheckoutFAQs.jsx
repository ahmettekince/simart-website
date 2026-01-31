"use client";

import React from "react";
import Accordion from "@/components/common/Accordion";

export default function CheckoutFAQs() {
  const checkoutFAQs = [
    {
      title: "Gizlilik Politikası",
      content: `
        <b>ŞIMART Teknoloji Şirketi</b><br/><br/>
        <b>ŞIMART Teknoloji Şirketi</b> (“ŞIMART Teknoloji,” veya ‘‘biz’’) gizliliğinizi koruma amacına bağlıdır. Bu Gizlilik Politikası hakkınızdaki veya şahsınızla ilişkili bilgilerin ŞIMART Teknoloji tarafından nasıl toplandığını, kullanıldığını ve alenileştirildiğini açıklamaktadır. Bu Politika, Hizmetimiz ile kaydolduğunuz kullanıcı cihazlarına (‘‘Robotlar’’) ve bu kullanıcı cihazlarına destek sağlayan (toplu olarak, ‘‘Hizmet’’) çevrimiçi uygulamalara (‘‘Uygulamalar’’) ilaveten, www.simart.me (‘‘Web Sitesi’’) dahil olmak üzere web sitesi ve Hizmetlerimiz için geçerlidir.<br/><br/>
        
        <b>BİLGİLERİ NASIL TOPLUYOR VE KULLANIYORUZ</b><br/>
        <b>Genel:</b> Size kişiselleştirilmiş, kullanışlı ve etkili bir deneyim sağlamak adına kişiselleştirilmiş bilgi toplamaktayız.<br/><br/>
        
        <b>Sağlamış olduğunuz bilgiler:</b> Bir ŞIMART Teknoloji hesabı için kaydolma, ŞIMART Teknoloji hizmetlerini kullanma, çevrimiçi alışveriş yapma, teklifler için giriş yapma, veya bizimle iletişime geçmeniz durumunda; <b>isminiz, e-posta adresiniz, kullanıcı adı ve şifreniz, teslimat adresiniz, fatura bilgileriniz ve telefon bilgileriniz</b> dahil olmak üzere kişisel bilgi toplamakta ve depolamaktayız.<br/><br/>
        
        <b>Akıllı Teknolojiyle Donatılmış Kayıtlı Cihazlardan Topladığımız Bilgiler:</b> Robotunuzu çevrimiçi Uygulamaya kaydettiğinizde, Robotun adı ve cihaz numarası gibi bilgileri, kullanım istatistiklerini (pil ömrü, sağlığı, çalışma zamanları vb.) toplamaktayız. <b>Bu bilgileri pazarlama amaçlarıyla üçüncü taraflar ile paylaşmıyoruz.</b><br/><br/>
        
        <b>BİZİMLE İLETİŞİME GEÇİN</b><br/>
        <b>Adres:</b> Yeşilova Mah. 4023. Cad. Ser Tower Apt. Dış Kapı: F Etimesgut/Ankara TÜRKİYE<br/>
        <b>Telefon:</b> 0850 346 6126<br/>
        <b>E-posta:</b> destek@simart.me<br/><br/>
        
        <b>Son Revizyon Tarihi:</b> 01/11/2024
      `
    },
    {
      title: "Şartlar ve Koşullar",
      content: `
        <b>1.1- SATICI:</b><br/>
        <b>Unvanı:</b> Şımart Teknoloji Sanayi ve Ticaret A.Ş.<br/>
        <b>Adresi:</b> Yeşilova Mah. 4023. Cad. Ser Tower Apt. Dış Kapı: F Etimesgut/Ankara TÜRKİYE<br/>
        <b>Posta Kodu:</b> 06796<br/>
        <b>Telefon:</b> 0850 346 6126<br/>
        <b>E-mail:</b> destek@simart.me<br/><br/>

        <b>MADDE 2- KONU</b><br/>
        İşbu sözleşmenin konusu, <b>Şımart Teknoloji Sanayi ve Ticaret A.Ş.</b> internet sitesinden elektronik ortamda siparişini yaptığı, nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 4077 sayılı Tüketicilerin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmeleri Uygulama Esas ve Usulleri Hakkında Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.<br/><br/>

        <b>MADDE 4- GENEL HÜKÜMLER</b><br/>
        <b>4.1-</b> ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.<br/>
        <b>4.2-</b> Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.<br/>
        <b>4.3-</b> SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun teslim edilmesinden sorumludur.<br/><br/>

        <b>MADDE 5- CAYMA HAKKI</b><br/>
        ALICI, ürünün kendisine tesliminden itibaren <b>14 gün</b> (yasal düzenlemeye uygun olarak) içinde cayma hakkına sahiptir.
      `
    },
    {
      title: "İade ve Geri Ödeme Politikası",
      content: `
        <b>Satın aldığım ürünü nasıl iade edebilirim?</b><br/>
        Siparişinizi teslim aldıktan sonra ürünlerinizi iade etmek istiyorsanız, teslim tarihinden en geç <b>14 iş günü</b> içerisinde <b>+90 850 346 6126</b> numaralı çağrı merkezimizi arayarak ya da <b>www.simart.me</b> hesabınıza girerek iade talebi oluşturabilirsiniz. Aras Kargo ile ücretsiz gönderim için iade onay kodu almanız gerekmektedir.<br/><br/>

        <b>Dikkat Edilmesi Gereken Hususlar:</b><br/>
        • Ürün(ler) orijinal ambalajı hasar görmemiş, kullanılmamış ve zarar görmemiş olmalıdır.<br/>
        • Ürünün satış faturası mutlaka gönderilmeli ve arkasındaki iade bölümü doldurulmalıdır.<br/>
        • <b>Kurumsal faturalarda</b>, kurumun düzenlediği 'İade Faturası' olmadan iade kabul edilememektedir.<br/><br/>

        <b>İade etme süresi kaç gündür?</b><br/>
        Sebep göstermeden cayma hakkı süresi <b>14 iş günüdür</b>. Üründen kaynaklanan kusurlarda bu süre 30 gündür.<br/><br/>

        <b>Geri ödeme ne zaman yapılır?</b><br/>
        İadeniz kabul edildiğinde para iadeniz gerçekleşir ve e-mail ile bilgilendirilirsiniz. İadenin hesabınıza yansıma süresi bankanıza bağlı olarak değişmektedir.
      `
    }
  ];

  return (
    <div className="mt_40">
      <div className="flat-accordion style-default has-btns-arrow">
        <Accordion faqs={checkoutFAQs} />
      </div>
    </div>
  );
}
