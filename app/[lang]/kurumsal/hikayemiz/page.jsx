
import { AboutLayout } from "@/components/about/about-layout"
import { ContentSection } from "@/components/about/content-section"

export const metadata = {
    title: "Hikayemiz - Şımart Teknoloji",
    description: "Şımart Teknoloji'nin kuruluş hikayesini, başarı yolculuğunu ve akıllı ev teknolojilerinde nasıl öncü bir marka haline geldiğini keşfedin. Vizyonumuzu ve misyonumuzu öğrenin.",
    keywords: "Şımart Teknoloji, Hikayemiz, Şımart Kuruluş Hikayesi, Akıllı Ev Teknolojisi, Başarı Yolculuğu, Teknoloji Markası, Şımart Misyon ve Vizyon, Yenilikçi Çözümler, Akıllı Ev Çözümleri",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Hikayemiz - Şımart Teknoloji",
        description: "Şımart Teknoloji'nin kuruluş hikayesini, başarı yolculuğunu ve akıllı ev teknolojilerinde nasıl öncü bir marka haline geldiğini keşfedin. Vizyonumuzu ve misyonumuzu öğrenin.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/hikayemiz",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Hikayemiz - Şımart Teknoloji",
        description: "Şımart Teknoloji'nin kuruluş hikayesini, başarı yolculuğunu ve akıllı ev teknolojilerinde nasıl öncü bir marka haline geldiğini keşfedin. Vizyonumuzu ve misyonumuzu öğrenin.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Hikayemiz - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji'nin kuruluş hikayesini, başarı yolculuğunu ve akıllı ev teknolojilerinde nasıl öncü bir marka haline geldiğini keşfedin. Vizyonumuzu ve misyonumuzu öğrenin.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

const sectionData = {
    id: "hikayemiz",
    title: "HİKAYEMİZ",
    contentBlocks: [
        {
            subtitle: "Türk Mühendislerle, Türk Halkına, Yüksek Teknolojiyle Hizmet",
            paragraphs: [
                "<p>Nesnelerin İnterneti'nin (IoT) ortaya çıkışı, hayatımızı pek çok şekilde değiştirdi. IoT teknolojisi, cihazları birbirine bağlayarak ve iletişim kurmalarını sağlayarak, birkaç yıl önce imkansız olan şeyleri yapmamızı mümkün kıldı. <strong>ŞIMART</strong> olarak hayatınızı kolaylaştırarak daha keyifli hale getiren yenilikçi ve yüksek teknolojili ürünler geliştirmeye adadık.</p>",
                "<p>Türk mühendisleri olarak IoT sektöründe, gerek hanelerimizde gerekse endüstriyel ve toplu kullanım alanlarında faydalanılacak birbirinden özel teknolojik ürünleri ülkemizde tasarlayıp üreten ilk üretici olma misyonu ve hedefiyle yola çıktık.</p>",
                "<p>Akıllı ev sistemleri veya otomatik aydınlatma sistemleri gibi kolaylık çözümleri arayan ev sahiplerinden, verimli yönetim araçları arayan işletme sahiplerine kadar ürünlerimizi kullanan herkesin teknolojilerimiz aracılığıyla hayatlarının zenginleştiğini hissetmesini istiyoruz.</p>",
                "<p>Yalnızca en yeni özellikleri sağlamakla kalmıyor, aynı zamanda bunların kullanımının kolay ve sezgisel olmasını sağlıyoruz, bu sayede önceden deneyimi olmayanlar bile bu teknolojik ürünlerden hızla faydalanabiliyor.</p>",
                "<p><strong>ŞIMART</strong> olarak hedefimiz, yeni teknolojilerin inovasyonu söz konusu olduğunda her zaman ön planda olmak ve bu yolda her adımda üst düzey müşteri hizmetleri sunmaktır. Böylece teknoloji inovasyonunda iş ortağınız olarak bizi seçtiğinizde yenilikçi çözüm ve yüksek kalite elde edeceğinizi bilirsiniz!</p>",
            ],
        },
    ],
}

export default function HikayemizPage() {
    return (
        <>
            <AboutLayout currentSectionId="hikayemiz">
                {/* Section Title */}
                <div className="mb-4">
                    <h1 className="about-section-title" style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: 'var(--primary, #3c81b5)',
                        borderBottom: '3px solid var(--primary, #3c81b5)',
                        display: 'inline-block',
                        paddingBottom: '8px',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                    }}>
                        {sectionData.title}
                    </h1>
                </div>

                {/* Content Area */}
                <div>
                    <ContentSection section={sectionData} />
                </div>
            </AboutLayout>
        </>
    )
}
