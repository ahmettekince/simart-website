import React from "react";
import QrCodeClient from "./QrCodeClient";

export async function generateMetadata({ params }) {
  const { lang } = params;
  
  if (lang === "en") {
    return {
      title: "Download Şımart App | Local Smart Home System",
      description: "Şımart Technology's life-simplifying local technology smart products are now at your fingertips. With the app, you can remotely control your Şımart smart devices and create scenarios.",
      keywords: "şımart teknoloji, şımart app, smart home app, local smart home, smart product control, download şımart android, download şımart ios",
    };
  }

  return {
    title: "Şımart Uygulamasını İndirin | Yerli Akıllı Ev Sistemi",
    description: "Şımart Teknoloji'nin hayatınızı kolaylaştıran yerli teknoloji akıllı ürünleri artık parmağınızın ucunda. Uygulama sayesinde Şımart akıllı cihazlarınızı uzaktan kontrol edebilir, senaryolar oluşturabilirsiniz.",
    keywords: "şımart teknoloji, şımart uygulaması, akıllı ev uygulaması, yerli akıllı ev, akıllı ürün kontrolü, android şımart indir, ios şımart indir",
  };
}

export default function QrCodePage() {
  return <QrCodeClient />;
}
