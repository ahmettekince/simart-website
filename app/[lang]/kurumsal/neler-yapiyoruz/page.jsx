import Header from "@/components/headers/Header"
import { AboutLayout } from "@/components/about/about-layout"
import { ContentSection } from "@/components/about/content-section"

export const metadata = {
    title: "Ne Yapıyoruz - Şımart Teknoloji",
    description: "Şımart Teknoloji olarak, yenilikçi akıllı ev çözümlerimiz ve müşteri odaklı hizmetlerimizle yaşam alanlarınızı daha akıllı hale getiriyoruz. Bizimle tanışın.",
    keywords: "Şımart Teknoloji, Kurumsal, Akıllı Ev Çözümleri, Yenilikçi Ürünler, Müşteri Odaklı Hizmet, Şımart Teknoloji Hakkında, Akıllı Ev Sistemleri, Teknoloji Şirketi, Akıllı Ürünler, Şımart Misyon ve Vizyon",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Ne Yapıyoruz - Şımart Teknoloji",
        description: "Şımart Teknoloji olarak, yenilikçi akıllı ev çözümlerimiz ve müşteri odaklı hizmetlerimizle yaşam alanlarınızı daha akıllı hale getiriyoruz. Bizimle tanışın.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/neler-yapiyoruz",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Ne Yapıyoruz - Şımart Teknoloji",
        description: "Şımart Teknoloji olarak, yenilikçi akıllı ev çözümlerimiz ve müşteri odaklı hizmetlerimizle yaşam alanlarınızı daha akıllı hale getiriyoruz. Bizimle tanışın.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Ne Yapıyoruz - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji olarak, yenilikçi akıllı ev çözümlerimiz ve müşteri odaklı hizmetlerimizle yaşam alanlarınızı daha akıllı hale getiriyoruz. Bizimle tanışın.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

const sectionData = {
    id: "neler-yapiyoruz",
    title: "NE YAPIYORUZ ?",
    contentBlocks: [
        {
            paragraphs: [
                "Akıllı ev sistemlerimiz arasında çeşitli akıllı ampuller, akıllı klozet kapağı, akıllı kumanda, akıllı priz, akıllı parmak ve bluetooth ağ geçidi bulunur. <strong>ŞIMART</strong>'ın akıllı ev sistemleri ile evinizin aydınlatmasını, sıcaklığını ve daha fazlasını akıllı telefonunuzdan birkaç dokunuşla kolayca kontrol edebilirsiniz. Güvenlik sistemlerimiz sizi ve ailenizi güvende tutmak için tasarlanmıştır. Akıllı duman, hareket ve kapı pencere sensörleri, yanıcı gaz alarmı, su kaçağı dedektörü ve akıllı kamera sayesinde eviniz her zaman güvende ve koruma altında olur. katya Serisi Akıllı Robot Süpürgelerimiz evinizin temizliğini zahmetsiz ve verimli hale getirir. Sağlıklı bir yaşam tarzı için, kilonuzu ve vücut kompozisyonunuzu takip eden akıllı tartı ile antrenmanınızı izlemenize olanak sağlayan, ayrıca kondisyonunuzu geliştirmenize yardımcı olan akıllı atlama ipi sunuyoruz. <strong>ŞIMART</strong> olarak, müşterilerimize hayatlarını daha rahat, konforlu ve güvenli hale getirmek için en son teknolojiyi sağlamaya kararlıyız. <strong>ŞIMART</strong>'ı seçtiğiniz için teşekkür ederiz.",
            ],
        },
        {
            subtitle: "Güçlü Hedefler, Emin Adımlar​",
            paragraphs: [
                "<p>Hedefimiz, müşteri beklentilerini karşılamak için ürün yelpazemizi ve hizmetlerimizi sürekli genişletmek, Türk hane yapısına uygun teknolojik ürünler üretmektir. Tasarımı ve üretimi tamamen Türk mühendisler tarafından gerçekleştirilen ürünlerimizi diğer ülkelere ihraç ederek ülke ekonomisine katkıda bulunmayı amaçlıyoruz. Satış ve satış sonrası üst düzey müşteri hizmeti anlayışını esas alıyoruz. Müşterilere en iyi memnuniyeti sunan ürün ve hizmetleri oluşturmakta kararlıyız. Son olarak, içinde yaşadığımız topluma ve çevreye saygılı örnek bir kuruluş, tüketicilerin güvenebileceği, samimi, güvenilir ve şeffaf bir şirket olmak için çalışıyoruz.</p>"
            ]
        },
        {
            subtitle: "Adanmış Bir Topluluk",
            paragraphs: [
                "<p>Misyonumuz, kullanıcıların hayatlarını zenginleştiren yenilikçi ve verimli çözümler ortaya koymak için en son teknolojiyi kullanarak en üst düzeyde müşteri memnuniyeti sağlamaktır. Türkiye ve dünyadaki dijitalleşme yolculuğunun ayrılmaz bir parçası olmaya kararlıyız ve her adımda müşterilerimizin deneyimlerine değer katmak için çalışıyoruz. Bu sırada da hem yerli ve milli kalkınmaya destek olmaya, hem ülke ekonomisine katma değer sağlamaya devam ediyoruz.</p>"
            ]
        }
    ],
}

export default function NeYapiyoruzPage() {
    return (
        <>
            <Header />
            <AboutLayout currentSectionId="neler-yapiyoruz">
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
