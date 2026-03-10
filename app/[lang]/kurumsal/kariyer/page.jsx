
import { AboutLayout } from "@/components/about/about-layout"
import { CareerSection } from "@/components/about/career-section"

export const metadata = {
    title: "Kariyer - Şımart Teknoloji",
    description: "Şımart Teknoloji kariyer sayfasına hoş geldiniz. Akıllı ev teknolojileri alanında yetenekli ekip arkadaşları arıyoruz. Yenilikçi projelerde yer almak ve kariyerinize Şımart Teknoloji'de yön vermek için başvurun.",
    keywords: "Şımart Teknoloji Kariyer, Şımart İş Başvurusu, Şımart Teknoloji İş İlanları, Şımart Teknoloji Çalışma Fırsatları, Akıllı Ev Sistemleri İş Başvurusu, Şımart İşe Alım, Şımart Teknoloji İnsan Kaynakları, Şımart Kariyer Olanakları, Şımart Teknoloji Ekip Arkadaşı Arayışı, Şımart Teknoloji'de Çalışmak",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Kariyer - Şımart Teknoloji",
        description: "Şımart Teknoloji kariyer sayfasına hoş geldiniz. Akıllı ev teknolojileri alanında yetenekli ekip arkadaşları arıyoruz. Yenilikçi projelerde yer almak ve kariyerinize Şımart Teknoloji'de yön vermek için başvurun.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/kariyer",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kariyer - Şımart Teknoloji",
        description: "Şımart Teknoloji kariyer sayfasına hoş geldiniz. Akıllı ev teknolojileri alanında yetenekli ekip arkadaşları arıyoruz. Yenilikçi projelerde yer almak ve kariyerinize Şımart Teknoloji'de yön vermek için başvurun.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Kariyer - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji kariyer sayfasına hoş geldiniz. Akıllı ev teknolojileri alanında yetenekli ekip arkadaşları arıyoruz. Yenilikçi projelerde yer almak ve kariyerinize Şımart Teknoloji'de yön vermek için başvurun.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

const careerFAQs = [
    {
        title: "İnovasyonun Kalbindeyiz",
        content: "Şımart Teknoloji olarak, inovasyonun kalbinde yer alarak geleceğin teknolojilerini geliştirmek için çalışıyoruz. Sektördeki en yeni ve ileri teknolojileri yakından takip ediyor, kullanıcılarımızın ihtiyaçlarını karşılayacak yaratıcı ve yenilikçi çözümler sunuyoruz. Yeniliği bir kültür haline getirip sürekli olarak daha iyi ürünler ve hizmetler sunma arzusuyla, çalışanlarımızı da bu yolculuğun bir parçası yapıyoruz."
    },
    {
        title: "Birlikte Büyümek",
        content: "Şımart Teknoloji’de, başarıya giden yolun takım çalışmasından geçtiğine inanıyoruz. Her bir çalışanımızın bireysel gelişimine önem veriyor, ortak hedefler doğrultusunda birlikte büyüyoruz. Takım ruhu, iş birliği ve güçlü iletişimle daha büyük başarılara imza atarken, her bir bireyin katkısını değerli kılıyoruz. Şımart Teknoloji ailesine katılarak, sadece bir iş değil, kariyerinizde anlamlı bir yolculuk yaşayacaksınız."
    },
    {
        title: "Kariyerinizi şekillendirin",
        content: "Şımart Teknoloji’de, kariyerinizin kontrolü sizde. Kendi potansiyelinizi keşfetmenizi ve profesyonel hedeflerinizi gerçekleştirmenizi sağlayacak fırsatlar sunuyoruz. Yalnızca iş değil, kişisel gelişim ve kariyer yolculuğunda her adımda yanınızdayız. Dinamik bir çalışma ortamında, yenilikçi projelerde yer alarak kariyerinizi şekillendirin ve gelecekteki başarılarınızın temelini burada atın."
    },
]

export default function KariyerPage() {
    return (
        <>
            <AboutLayout currentSectionId="kariyer">
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
                        KARİYER
                    </h1>
                </div>

                {/* Content Area */}
                <CareerSection faqs={careerFAQs} />
            </AboutLayout>
        </>
    )
}
