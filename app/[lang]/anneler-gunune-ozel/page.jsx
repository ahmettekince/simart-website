import React from "react";
import { getProducts } from "@/api/products";
import ProductCardSimart from "@/components/shopCards/ProductCardSimart";

const MOTHERS_DAY_SLUGS = [
    "anneler-gunu-firsat-paketi",
    "katya-uu-akilli-robot-supurge",
    "katya-v-plus-akilli-robot-supurge",
    "katya-v-akilli-robot-supurge",
    "katya-p-akilli-robot-supurge",
    "katyaz-akilli-robot-supurge",
    "cam-temizleme-robotu-kare",
    "cam-temizleme-robotu",
    "cam-temizleme-robotu-yeni-nesil",
    "akilli-bebek-kamerasi",
    "hava-nemlendirici",
    "akilli-kahve-makinesi",
    "akilli-dik-supurge",
    "akilli-hava-fritozu-airfryer"
];

const translations = {
    tr: {
        title: "Anneler Günü Hediyeleri - Şımart Teknoloji",
        description: "Anneler Günü'ne özel akıllı hediye seçenekleri! Annelerimizi teknolojiyle gülümsetecek en iyi ürünler Şımart'ta.",
        h1: "Şımart Teknoloji - Anneler Günü Özel Kampanyası",
        pageTitle: "Anneler Gününe Özel"
    },
    en: {
        title: "Mother's Day Gifts - Şımart Technology",
        description: "Special smart gift options for Mother's Day! The best products to make our mothers smile with technology are at Şımart.",
        h1: "Şımart Technology - Mother's Day Special Campaign",
        pageTitle: "Mother's Day"
    }
};

export async function generateMetadata({ params }) {
    const { lang = "tr" } = await params;
    const t = translations[lang] || translations.tr;

    return {
        title: t.title,
        description: t.description,
    };
}

export default async function MothersDayPage({ params }) {
    const { lang = "tr" } = await params;
    const t = translations[lang] || translations.tr;

    // Tüm ürünleri çek
    const allProducts = await getProducts({}, lang);

    // Sadece kampanya slug listesinde olanları filtrele
    const campaignProducts = allProducts.filter(product =>
        MOTHERS_DAY_SLUGS.includes(product.slug)
    );

    return (
        <main className="mothers-day-page" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            {/* SEO için gizli H1 */}
            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
                {t.h1}
            </h1>

            <div className="container">
                {/* Sade Başlık */}
                <div className="text-center mb_60">
                    <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111' }}>{t.pageTitle}</h2>
                    <div style={{ width: '60px', height: '3px', background: '#3c81b5', margin: '20px auto 0' }}></div>
                </div>

                {/* Ürün Listesi */}
                <div className="row g-4 pb_80">
                    {campaignProducts.length > 0 ? (
                        campaignProducts.map((product) => (
                            <div key={product.id} className="col-6 col-md-4 col-lg-3">
                                <ProductCardSimart product={product} />
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <p>Kampanya ürünleri şu an yüklenemedi.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
