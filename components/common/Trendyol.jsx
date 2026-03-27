export default function Trendyol({ productSlug }) {
    const getTrendyolUrl = (slug) => {
        const mapping = {
            "akilli-bluetooth-ampul": "https://www.trendyol.com/simart-teknoloji/akilli-rgb-led-ampul-bluetooth-16m-renk-ayarlanabilir-parlaklik-p-376730755?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-bluetooth-ampul-12w": "https://www.trendyol.com/simart/akilli-ampul-bluetooth-1100-lumen-yuksek-parlaklik-16-milyon-renk-secenegi-p-1039283643?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "simart-akilli-ampul": "",
            "simart-akilli-ampul-12w": "https://www.trendyol.com/simart/akilli-ampul-wifi-rgb-1100-lumen-yuksek-parlaklik-uygulama-kontrollu-p-1039280442?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-v-akilli-robot-supurge": "https://www.trendyol.com/simart/katya-v-akilli-robot-supurge-10000pa-guclu-emis-gucu-6400mah-yuksek-batarya-p-1056110396?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-v-plus-akilli-robot-supurge": "https://www.trendyol.com/simart/katya-v-akilli-robot-supurge-10000pa-premium-otomatik-toz-toplama-uniteli-p-1056128819?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-p-akilli-robot-supurge": "https://www.trendyol.com/simart/katya-p-akilli-robot-supurge-kil-kesici-bicakli-ana-firca-8000pa-emis-gucu-p-1069935890?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-t-akilli-robot-supurge": "https://www.trendyol.com/simart-teknoloji/katya-t-akilli-robot-supurge-otomatik-toz-bosaltma-ve-mop-ozellikli-p-812360591?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katyaz-akilli-robot-supurge": "https://www.trendyol.com/simart-teknoloji/katya-z-akilli-robot-supurge-2-si-1-arada-islak-mop-ve-yuksek-emis-gucu-p-673805588?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "cam-temizleme-robotu": "https://www.trendyol.com/simart-teknoloji/akilli-cam-silme-robotu-uygulama-ve-kumanda-kontrollu-guclu-motorlu-p-780914888?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "cam-temizleme-robotu-kare": "",
            "cam-temizleme-robotu-yeni-nesil": "https://www.trendyol.com/simart/akilli-cam-temizleme-robotu-uygulama-ve-kumanda-kontrollu-3200pa-vakum-gucu-yeni-nesil-p-1045446592?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-mutfak-terazisi": "https://www.trendyol.com/simart/akilli-mutfak-terazisi-bluetooth-destekli-hassas-dijital-olcum-p-929608002?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-gida-termometresi": "https://www.trendyol.com/simart/akilli-gida-termometresi-yemek-et-izgara-ve-bebek-mamasi-p-872524915?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-hava-fritozu-airfryer": "https://www.trendyol.com/simart-teknoloji/akilli-airfryer-xxl-7-2l-kapasite-ve-coklu-pisirme-fonksiyonu-p-735929453?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-termometre": "https://www.trendyol.com/simart/akilli-termometre-wi-fi-baglantili-sicaklik-ve-nem-olcer-uygulama-destekli-p-979529069?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kulaklik": "https://www.trendyol.com/simart/akilli-bluetooth-kulaklik-anc-ve-uygulama-destekli-yuksek-ses-kalitesi-p-931214663?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kumanda": "https://www.trendyol.com/simart-teknoloji/akilli-ir-wifi-kumanda-kumandali-cihazlarinizi-akillandirin-p-446425377?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-parmak": "",
            "termostatik-radyator-vanasi-ble": "https://www.trendyol.com/simart-teknoloji/akilli-termostatik-radyator-vanasi-bluetooth-baglantili-ve-isi-kontrolu-p-780464950?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "termostatik-radyator-vanasi-wi-fi": "https://www.trendyol.com/simart/akilli-termostatik-radyator-vanasi-wi-fi-baglantili-ve-uzaktan-kontrol-p-1065024948?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "bluetooth-ag-gecidi": "https://www.trendyol.com/simart-teknoloji/bluetooth-ag-gecidi-akilli-cihazlariniz-icin-wi-fi-baglantisi-p-472157702?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-klozet-kapagi": "https://www.trendyol.com/simart-teknoloji/akilli-klozet-kapagi-isitmali-ve-otomatik-temizlik-p-376672470?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-perde-motoru": "https://www.trendyol.com/simart-teknoloji/akilli-perde-motoru-coklu-perde-tipiyle-uyumlu-p-780224204?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-priz-usb-type-c": "https://www.trendyol.com/simart-teknoloji/akilli-wi-fi-priz-usb-type-c-akim-korumali-uzaktan-kontrol-p-814134881?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "simart-akilli-priz": "https://www.trendyol.com/simart/akilli-wi-fi-priz-zaman-ayarli-akim-korumali-uzaktan-kontrol-p-827576753?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-bebek-kamerasi": "https://www.trendyol.com/simart/akilli-bebek-kamerasi-aglama-ve-hareket-algilama-cift-yonlu-sesli-iletisim-p-978348600?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-dis-mekan-kamerasi": "https://www.trendyol.com/simart/akilli-wifi-dis-mekan-guvenlik-kamerasi-gunes-enerjili-gece-goruslu-p-929681886?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kamera-360-3k": "https://www.trendyol.com/simart/akilli-360-kamera-wi-fi-1620p-3k-ultra-goruntu-kalitesi-gece-gorus-ses-gonderme-ve-alma-p-872500567?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kamera-360": "",
            "akilli-kapi-kilidi": "https://www.trendyol.com/simart/akilli-kapi-kilidi-parmak-izi-sifre-kombinasyonu-akilli-kart-fiziksel-anahtar-ve-mobil-uygulama-p-1026506292?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "simart-akilli-su-kacagi-dedektoru": "https://www.trendyol.com/simart/akilli-su-kacagi-dedektoru-problu-100db-alarm-sesli-uygulama-bildirimli-p-1027945763?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-duman-sensoru": "https://www.trendyol.com/simart-teknoloji/akilli-duman-sensoru-wi-fi-kontrollu-ve-gercek-zamanli-alarm-p-472408150?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-vana-kontrolu": "https://www.trendyol.com/simart-teknoloji/akilli-vana-kontrolu-su-ve-gaz-vanalari-icin-uzaktan-kontrol-p-780268152?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "yanici-gaz-alarmi": "https://www.trendyol.com/simart-teknoloji/akilli-yanici-gaz-alarmi-mobil-bildirim-ve-sesli-uyari-p-472921648?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "hareket-sensoru": "https://www.trendyol.com/simart-teknoloji/akilli-pir-hareket-sensoru-guvenlik-ve-otomasyon-icin-hassas-algilama-p-283445429?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kapi-pencere-alarmi": "https://www.trendyol.com/simart/akilli-kapi-ve-pencere-alarmi-wi-fi-kontrollu-ve-yuksek-alarm-sesi-p-858576289?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kapi-zili": "https://www.trendyol.com/simart/akilli-kapi-zili-wi-fi-kontrollu-gece-gorus-ses-gonderme-ve-alma-p-859182604?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-siren": "https://www.trendyol.com/simart/akilli-siren-110-desibel-guclu-alarm-ve-mobil-uygulama-kontrollu-p-1064491827?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-dambil": "https://www.trendyol.com/simart/akilli-dambil-2x1-kg-uygulama-destekli-sesli-yonlendirmeli-lcd-ekranli-p-1026547296?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-acil-yardim-butonu": "https://www.trendyol.com/simart/akilli-acil-yardim-butonu-yasli-ve-hastalar-icin-tek-tusla-bildirim-p-929602827?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-ilac-kutusu": "https://www.trendyol.com/simart/akilli-ilac-kutusu-bluetooth-baglantili-sesli-alarm-ve-bildirim-p-929699870?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-egzersiz-cemberi": "https://www.trendyol.com/simart/akilli-egzersiz-cemberi-ayarlanabilir-agirlikli-uygulama-destekli-p-929697624?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "simart-elektronik-akilli-tarti": "https://www.trendyol.com/simart-teknoloji/akilli-tarti-yag-olcer-kas-analizli-ve-vucut-takipli-p-292909870?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-atlama-ipi": "https://www.trendyol.com/simart-teknoloji/akilli-atlama-ipi-performans-takipli-ve-dijital-led-ekranli-p-283889359?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-6-hazneli-mama-kabi": "https://www.trendyol.com/simart/6-hazneli-akilli-mama-kabi-uygulama-kontrollu-sogutuculu-yas-mama-uyumlu-p-985782079?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-evcil-hayvan-sebili": "https://www.trendyol.com/genel-markalar/akilli-evcil-hayvan-sebili-3l-kapasite-ve-wi-fi-kontrollu-su-filtreleme-p-862782586?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-mama-kabi": "https://www.trendyol.com/simart/akilli-mama-kabi-3l-kapasiteli-ve-wi-fi-kontrollu-otomatik-besleme-p-862783531?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-kedi-oyuncagi": "https://www.trendyol.com/simart/akilli-lazer-kedi-oyuncagi-p-858585199?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akvaryum-yemleme-robotu": "https://www.trendyol.com/simart/akvaryum-yemleme-robotu-p-806719685?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "cam-kokulu-robot-supurge-sivi-deterjan": "https://www.trendyol.com/simart-teknoloji/cam-ferahligi-kokulu-robot-supurge-deterjani-dogal-ve-etkili-temizlik-p-679686187?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "beyaz-sabun-kokulu-robot-supurge-sivi-deterjan": "https://www.trendyol.com/simart-teknoloji/beyaz-sabun-kokulu-robot-supurge-deterjani-ferah-ve-derinlemesine-temizlik-p-679689356?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "akilli-evcil-hayvan-sebili-yedek-filtre": "https://www.trendyol.com/genel-markalar/akilli-evcil-hayvan-su-sebili-uyumlu-yedek-filtre-6-adet-p-871756368?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-t-sarf-seti-silme-supurme": "https://www.trendyol.com/simart/katya-t-uyumlu-sarf-seti-silme-supurme-p-871669452?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-t-sarf-seti-supurme": "https://www.trendyol.com/simart/katya-t-uyumlu-sarf-seti-supurme-p-871670209?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-t-5-adet-toz-torbasi": "https://www.trendyol.com/simart-teknoloji/katya-t-toz-torbasi-5-adet-p-849301271?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-robot-supurge-yenileme-seti": "https://www.trendyol.com/simart-teknoloji/simart-katya-robot-supurge-yenileme-seti-1-p-382155184?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-z-sarf-seti-silme-supurme": "https://www.trendyol.com/simart-teknoloji/eski-seri-uyumlu-katya-z-robot-supurge-sarf-seti-silme-supurme-p-717661209?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "katya-u-akilli-robot-supurge-silme-supurme-sarf-seti": "https://www.trendyol.com/simart/katya-u-akilli-robot-supurge-silme-supurme-sarf-seti-p-1010962709?boutiqueId=61&merchantId=790294&filterOverPriceListings=false&sav=true",
            "hava-nemlendirici": "https://www.trendyol.com/simart/akilli-hava-nemlendirici-wi-fi-kontrollu-5lt-su-hazneli-p-1120562886",
            "akilli-led-serit-2-5-metre": "https://www.trendyol.com/simart/akilli-led-serit-2-5-metre-wi-fi-kontrollu-rgb-led-aydinlatma-p-1118764736",
            "akilli-led-serit-5-metre": "https://www.trendyol.com/simart/akilli-led-serit-5-metre-wi-fi-kontrollu-rgb-led-aydinlatma-p-1118766002"
        };

        const foundUrl = mapping[slug];
        if (foundUrl) return foundUrl;
        if (foundUrl === "") return null;
        return "https://www.trendyol.com/magaza/simart-pazarlama-m-790294?sst=0&channelId=1";
    };

    const finalUrl = getTrendyolUrl(productSlug);
    if (!finalUrl) return null;

    return (
        <div className="try-tr-box d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mt-3 gap-3 gap-md-4">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
                <img
                    src="/trendyol.webp"
                    alt="Trendyol"
                    className="try-logo"
                />

                <div className="try-text text-start">
                    <div className="fw-normal" style={{ fontSize: "14px", color: "#333", marginBottom: "0px" }}>Kaçırılmayacak Fırsat</div>
                    <div className="try-highlight" style={{ fontSize: "14px", color: "#f27a1a", fontWeight: "500", lineHeight: "1.2" }}>
                        Birçok ürün, Trendyol’da geçerli olmak üzere %50’ye varan kampanyalı fiyatlarla sunuluyor.
                    </div>
                </div>
            </div>

            <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn try-tr-btn text-white ps-4 pe-4 pt-2 pb-2"
                style={{
                    backgroundColor: "#ff7f00",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "15px",
                    whiteSpace: "nowrap",
                }}
            >
                Ürüne Git
            </a>

            <style jsx>{`
                .try-logo {
                    height: 24px;
                    width: auto;
                    object-fit: contain;
                    flex-shrink: 0;
                }
                .try-tr-box {
                    background-color: #fff;
                    border: 2px solid #ff7f00;
                    border-radius: 12px;
                }
                .try-tr-btn:hover {
                    background-color: #e67200 !important;
                }
                @media (max-width: 768px) {
                    .try-tr-box {
                        gap: 12px;
                    }
                    .try-tr-btn {
                        width: 100%;
                    }
                    .try-text {
                        text-align: left !important;
                    }
                }
            `}</style>
        </div>
    );
}