import { useLangStore } from "@/stores/langStore";

const translations = {
    tr: {
        opportunity: "Kaçırılmayacak Fırsat",
        description: "Birçok ürün, MediaMarkt’ta geçerli olmak üzere %50’ye varan kampanyalı fiyatlarla sunuluyor.",
        goToProduct: "Ürüne Git"
    },
    en: {
        opportunity: "Opportunity Not to Be Missed",
        description: "Many products are offered at discounted prices up to 50%, valid on MediaMarkt.",
        goToProduct: "Go to Product"
    }
};

export default function MediaMarkt({ productSlug }) {
    const lang = useLangStore((s) => s.lang);
    const t = translations[lang] || translations.tr;
    const getMediaMarktUrl = (slug) => {
        const mapping = {
            // MediaMarkt specific product URLs can be added here
            "akilli-bluetooth-ampul": "https://www.mediamarkt.com.tr/tr/product/_simart-bluetooth-16m-renk-ayarlanabilir-parlaklik-rgb-akilli-led-ampul-165881436.html",
            "akilli-bluetooth-ampul-12w": "https://www.mediamarkt.com.tr/tr/product/_simart-bluetooth-1100-lumen-yuksek-parlaklik-16-milyon-renk-secenegi-bluetooth-akilli-ampul-165881382.html",
            "simart-akilli-ampul": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-16m-renk-uzaktan-kontrol-ve-sesli-asistan-uyumlu-rgb-akilli-led-ampul-165881371.html",
            "katya-p-akilli-robot-supurge": "https://www.mediamarkt.com.tr/tr/product/_simart-katya-p-kil-kesici-bicakli-ana-firca-8000pa-emis-gucu-akilli-robot-supurge-siyah-167806560.html",
            "katyaz-akilli-robot-supurge": "https://www.mediamarkt.com.tr/tr/product/_simart-katya-z-2si-1-arada-islak-mop-ve-yuksek-emis-gucu-akilli-robot-supurge-siyah-165526923.html",
            "cam-temizleme-robotu-kare": "https://www.mediamarkt.com.tr/tr/product/_simart-3300-pa-guclu-vakum-ve-akilli-kontrol-akilli-cam-temizleme-robotu-siyah-165526924.html",
            "cam-temizleme-robotu-yeni-nesil": "https://www.mediamarkt.com.tr/tr/product/_simart-uygulama-ve-kumanda-kontrollu-3200-pa-vakum-gucu-yeni-nesil-akilli-cam-temizleme-robotu-siyah-165526961.html",
            "akilli-mutfak-terazisi": "https://www.mediamarkt.com.tr/tr/product/_simart-bluetooth-destekli-hassas-dijital-olcum-akilli-mutfak-terazisi-siyah-165883213.html",
            "akilli-gida-termometresi": "https://www.mediamarkt.com.tr/tr/product/_simart-yemek-et-izgara-ve-bebek-mamasi-akilli-gida-termometresi-165880503.html",
            "akilli-hava-fritozu-airfryer": "https://www.mediamarkt.com.tr/tr/product/_simart-xxl-72l-kapasite-ve-coklu-pisirme-fonksiyonu-air-freyer-siyah-165883169.html",
            "akilli-termometre": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-baglantili-sicaklik-ve-nem-olcer-uygulama-destekli-akilli-termometre-165879863.html",
            "akilli-kumanda": "https://www.mediamarkt.com.tr/tr/product/_simart-kumandali-cihazlarinizi-akillandirin-akilli-ir-wi-fi-kumanda-165880509.html",
            "akilli-parmak": "https://www.mediamarkt.com.tr/tr/product/_simart-akilli-parmak-butonlar-icin-akilli-yonetim-buton-basici-167344522.html",
            "termostatik-radyator-vanasi-ble": "https://www.mediamarkt.com.tr/tr/product/_simart-bluetooth-baglantili-ve-isi-kontrolu-akilli-termostatik-radyator-vanasi-165879792.html",
            "termostatik-radyator-vanasi-wi-fi": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-baglantili-ve-uzaktan-kontrol-akilli-termostatik-radyator-vanasi-akilli-termostatik-radyator-vanasi-165879828.html",
            "bluetooth-ag-gecidi": "https://www.mediamarkt.com.tr/tr/product/_simart-akilli-cihazlariniz-icin-wi-fi-baglantisi-bluetooth-bluetooth-ag-gecidi-siyah-165883211.html",
            "akilli-klozet-kapagi": "https://www.mediamarkt.com.tr/tr/product/_simart-akilli-klozet-kapagi-isitmali-ve-otomatik-temizlik-169024980.html",
            "akilli-perde-motoru": "https://www.mediamarkt.com.tr/tr/product/_simart-coklu-perde-tipiyle-uyumlu-akilli-perde-motoru-165880547.html",
            "akilli-priz-usb-type-c": "https://www.mediamarkt.com.tr/tr/product/_simart-usb-type-c-akim-korumali-uzaktan-kontrol-wi-fi-akilli-priz-165881451.html",
            "simart-akilli-priz": "https://www.mediamarkt.com.tr/tr/product/_simart-zaman-ayarli-akim-korumali-uzaktan-kontrol-wi-fi-akilli-priz-165881381.html",
            "akilli-bebek-kamerasi": "https://www.mediamarkt.com.tr/tr/product/_simart-aglama-ve-hareket-algilama-cift-yonlu-sesli-iletisim-akilli-bebek-kamerasi-siyah-165883191.html",
            "akilli-dis-mekan-kamerasi": "https://www.mediamarkt.com.tr/tr/product/_simart-gunes-enerjili-gece-goruslu-akilli-wi-fi-dis-mekan-guvenlik-kamerasi-siyah-165883221.html",
            "akilli-kamera-360": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-3-mp-1296p-360-gece-goruslu-cift-yonlu-ses-hareket-algilama-akilli-kamera-siyah-165883162.html",
            "akilli-kapi-kilidi": "https://www.mediamarkt.com.tr/tr/product/_simart-parmak-izi-sifre-kombinasyonu-akilli-kart-fiziksel-anahtar-ve-mobil-uygulama-akilli-kapi-kilidi-165883283.html",
            "simart-akilli-su-kacagi-dedektoru": "https://www.mediamarkt.com.tr/tr/product/_simart-problu-100-db-alarm-sesli-uygulama-bildirimli-akilli-su-kacagi-dedektoru-akilli-su-kacagi-dedektoru-165580355.html",
            "akilli-duman-sensoru": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-kontrollu-ve-gercek-zamanli-alarm-akilli-duman-sensoru-akilli-duman-dedektoru-165583882.html",
            "akilli-vana-kontrolu": "https://www.mediamarkt.com.tr/tr/product/_simart-su-ve-gaz-vanalari-icin-uzaktan-kontrol-akilli-vana-kontrolu-167354019.html",
            "yanici-gaz-alarmi": "https://www.mediamarkt.com.tr/tr/product/_simart-mobil-bildirim-ve-sesli-uyari-akilli-yanici-gaz-alarmi-165881527.html",
            "hareket-sensoru": "https://www.mediamarkt.com.tr/tr/product/_simart-guvenlik-ve-otomasyon-icin-hassas-algilama-akilli-pir-akilli-hareket-sensoru-165581498.html",
            "akilli-kapi-pencere-alarmi": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-kontrollu-ve-yuksek-alarm-sesi-akilli-kapi-ve-penc",
            "akilli-kapi-zili": "https://www.mediamarkt.com.tr/tr/product/_simart-4mp-kamera-gece-goruslu-mobil-uygulama-ip54-sertifikali-hareket-sensorlu-akilli-kapi-zili-173772791.html",
            "akilli-siren": "https://www.mediamarkt.com.tr/tr/product/_simart-110-desibel-guclu-alarm-ve-mobil-uygulama-kontrollu-akilli-siren-167560109.html",
            "akilli-dambil": "https://www.mediamarkt.com.tr/tr/product/_simart-2x1-kg-uygulama-destekli-sesli-yonlendirmeli-lcd-ekranli-akilli-dambil-165883164.html",
            "akilli-acil-yardim-butonu": "https://www.mediamarkt.com.tr/tr/product/_simart-yasli-ve-hastalar-icin-tek-tusla-bildirim-akilli-acil-yardim-butonu-165880501.html",

            "akilli-egzersiz-cemberi": "https://www.mediamarkt.com.tr/tr/product/_simart-ayarlanabilir-agirlikli-uygulama-destekli-akilli-egzersiz-cemberi-167354004.html",
            "simart-elektronik-akilli-tarti": "https://www.mediamarkt.com.tr/tr/product/_simart-yag-olcer-kas-analizli-ve-vucut-takipli-akilli-tarti-siyah-165877655.html",
            "akilli-atlama-ipi": "https://www.mediamarkt.com.tr/tr/product/_simart-performans-takipli-ve-dijital-led-ekranli-akilli-atlama-ipi-165883205.html",
            "akilli-6-hazneli-mama-kabi": "https://www.mediamarkt.com.tr/tr/product/_simart-6-hazneli-uygulama-kontrollu-sogutuculu-yas-mama-uyumlu-akilli-mama-kabi-koyu-gri-165748650.html",
            "akilli-evcil-hayvan-sebili": "https://www.mediamarkt.com.tr/tr/product/_simart-3-l-kapasite-ve-wi-fi-kontrollu-su-filtreleme-akilli-su-kabi-siyah-165783991.html",
            "akilli-mama-kabi": "https://www.mediamarkt.com.tr/tr/product/_simart-3-l-kapasiteli-ve-wi-fi-kontrollu-otomatik-besleme-akilli-mama-kabi-siyah-165783989.html",
            "akilli-kedi-oyuncagi": "https://www.mediamarkt.com.tr/tr/product/_simart-otomatik-lazer-hareketi-ve-bluetooth-kontrollu-165883159.html",
            "akvaryum-yemleme-robotu": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-kontrollu-ve-otomatik-yemleme-akilli-akvaryum-yemleme-robotu-siyah-165783988.html",
            "cam-kokulu-robot-supurge-sivi-deterjan": "https://www.mediamarkt.com.tr/tr/product/_simart-cam-ferahligi-kokulu-dogal-ve-etkili-temizlik-robot-supurge-deterjani-165883285.html",
            "beyaz-sabun-kokulu-robot-supurge-sivi-deterjan": "https://www.mediamarkt.com.tr/tr/product/_simart-beyaz-sabun-kokulu-ferah-ve-derinlemesine-temizlik-robot-supurge-deterjani-165883203.html",
            "akilli-kapi-pencere-sensoru": "https://www.mediamarkt.com.tr/tr/product/_simart-wi-fi-kontrollu-ve-anlik-bildirimli-akilli-kapi-ve-pencere-sensoru-akilli-kapi-pencere-sensoru-165583668.html",
            "katya-u-akilli-robot-supurge-silme-supurme-sarf-seti": "",
            "hava-nemlendirici": "https://www.mediamarkt.com.tr/tr/product/_simart-akilli-wi-fi-kontrollu-5-l-su-hazneli-hava-nemlendirici-siyah-173765948.html",
            "akilli-led-serit-2-5-metre": "https://www.mediamarkt.com.tr/tr/product/_simart-akilli-25-m-wi-fi-kontrollu-rgb-bluetooth-led-serit-aydinlatma-173773810.html",
            "akilli-led-serit-5-metre": "https://www.mediamarkt.com.tr/tr/product/_simart-akilli-5-m-wi-fi-kontrollu-rgb-bluetooth-led-serit-aydinlatma-173765897.html",
            "akilli-kedi-tuvaleti": "https://www.mediamarkt.com.tr/tr/product/_simart-80lt-otomatik-temizleme-ve-wi-fi-kontrollu-akilli-kedi-tuvaleti-174207456.html",
            "akilli-anahtar-2-yonlu-wi-fi-role": "https://www.mediamarkt.com.tr/tr/product/_simart-2-yonlu-wi-fi-kontrollu-akilli-role-akilli-role-165880556.html",
            "akilli-anahtar-1-yonlu-wi-fi-role": "https://www.mediamarkt.com.tr/tr/product/_simart-1-yonlu-wi-fi-kontrollu-akilli-role-165880498.html",
            "katya-uu-akilli-robot-supurge": "https://www.mediamarkt.com.tr/tr/product/_simart-katya-u-15000pa-otomatik-mop-yikama-ve-kurutma-akilli-robot-supurge-siyah-175002099.html"
        };

        const foundUrl = mapping[slug];
        if (foundUrl) return foundUrl;
        if (foundUrl === "") return null;
        return "https://www.mediamarkt.com.tr/tr/search.html?query=%C5%9F%C4%B1mart";
    };

    const finalUrl = getMediaMarktUrl(productSlug);
    if (!finalUrl) return null;

    return (
        <div className="mm-box p-3 mt-3">
            <img
                src="/mediamarkt.png"
                alt="MediaMarkt"
                className="mm-logo"
            />

            <div className="mm-text text-start">
                <div className="fw-normal" style={{ fontSize: "14px", color: "#333", marginBottom: "0px" }}>{t.opportunity}</div>
                <div className="mm-highlight" style={{ fontSize: "14px", color: "#df0000", fontWeight: "500", lineHeight: "1.2" }}>
                    {t.description}
                </div>
            </div>

            <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn mm-btn text-white ps-4 pe-4 pt-2 pb-2"
                style={{
                    backgroundColor: "#df0000",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "15px",
                    whiteSpace: "nowrap",
                }}
            >
                {t.goToProduct}
            </a>

            <style jsx>{`
                .mm-logo {
                    height: 14px;
                    max-width: 100px;
                    width: auto;
                    object-fit: contain;
                    flex-shrink: 0;
                }
                .mm-box {
                    background-color: #fff;
                    border: 2px solid #df0000;
                    border-radius: 12px;
                    display: flex;
                }
                .mm-btn:hover {
                    background-color: #b30000 !important;
                }
                @media (min-width: 840px) {
                    .mm-box {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        gap: 24px;
                    }
                    .mm-text {
                        flex-grow: 1;
                    }
                }
                @media (max-width: 839px) {
                    .mm-box {
                        flex-direction: column;
                        gap: 12px;
                    }
                    .mm-logo {
                        align-self: flex-start;
                    }
                    .mm-btn {
                        width: 100%;
                    }
                    .mm-text {
                        text-align: left !important;
                    }
                }
            `}</style>
        </div>
    );
}
