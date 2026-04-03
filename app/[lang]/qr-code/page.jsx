import React from "react";
import QrCodeClient from "./QrCodeClient";

export const metadata = {
    title: "Şımart Uygulamasını İndirin | Yerli Akıllı Ev Sistemi",
    description: "Şımart Teknoloji'nin hayatınızı kolaylaştıran yerli teknoloji akıllı ürünleri artık parmağınızın ucunda. Uygulama sayesinde Şımart akıllı cihazlarınızı uzaktan kontrol edebilir, senaryolar oluşturabilirsiniz.",
    keywords: "şımart teknoloji, şımart uygulaması, akıllı ev uygulaması, yerli akıllı ev, akıllı ürün kontrolü, android şımart indir, ios şımart indir",
};

export default function QrCodePage() {
    return <QrCodeClient />;
}
