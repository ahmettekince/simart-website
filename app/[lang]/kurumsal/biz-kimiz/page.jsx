
import { AboutLayout } from "@/components/about/about-layout"
import { VideoSection } from "@/components/about/video-section"
import { ContentSection } from "@/components/about/content-section"
import { organizationSchema } from "@/lib/schema"
import { siteConfig } from "@/config/site"

export const metadata = {
    title: "Biz Kimiz? - Şımart Teknoloji",
    description: "Şımart Teknoloji, akıllı ev çözümleri alanında öncü bir marka olarak, yenilikçi ürünlerimiz ve müşteri odaklı hizmet anlayışımızla yaşam alanlarınızı daha akıllı hale getiriyoruz. Biz kimiz? Bizimle tanışın.",
    keywords: "Şımart Teknoloji, Kurumsal, Akıllı Ev Çözümleri, Yenilikçi Ürünler, Müşteri Odaklı Hizmet, Şımart Teknoloji Hakkında, Akıllı Ev Sistemleri, Teknoloji Şirketi, Akıllı Ürünler, Şımart Misyon ve Vizyon",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Biz Kimiz? - Şımart Teknoloji",
        description: "Şımart Teknoloji, akıllı ev çözümleri alanında öncü bir marka olarak, yenilikçi ürünlerimiz ve müşteri odaklı hizmet anlayışımızla yaşam alanlarınızı daha akıllı hale getiriyoruz. Biz kimiz? Bizimle tanışın.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/biz-kimiz",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Biz Kimiz? - Şımart Teknoloji",
        description: "Şımart Teknoloji, akıllı ev çözümleri alanında öncü bir marka olarak, yenilikçi ürünlerimiz ve müşteri odaklı hizmet anlayışımızla yaşam alanlarınızı daha akıllı hale getiriyoruz. Biz kimiz? Bizimle tanışın.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Biz Kimiz? - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji, akıllı ev çözümleri alanında öncü bir marka olarak, yenilikçi ürünlerimiz ve müşteri odaklı hizmet anlayışımızla yaşam alanlarınızı daha akıllı hale getiriyoruz. Biz kimiz? Bizimle tanışın.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

const sectionData = {
    id: "biz-kimiz",
    title: "BİZ KİMİZ ?",
    contentBlocks: [
        {
            paragraphs: [
                "<p><strong>ŞIMART</strong>, akıllı ev sistemleri ve IoT çözümleri alanında faaliyet gösteren, Türk mühendisleri tarafından kurulmuş bir teknoloji şirketidir. Misyonumuz, günlük hayatınızı kolaylaştıran ve zenginleştiren yenilikçi teknolojik ürünler geliştirmek ve sunmaktır.</p>",
                "<p>Akıllı ev sistemleri, robot süpürgeler, güvenlik sistemleri ve sağlık takip cihazları gibi geniş bir ürün yelpazesi sunuyoruz. Ürünlerimiz, Türk hanelerinin ihtiyaçlarına özel olarak tasarlanmış ve üretilmiştir.</p>",
                "<p><strong>Amacımız çok net:</strong> Günlük rutinlerinize sorunsuz bir şekilde entegre olan, kullanımı kolay ve akıllı çözümler sunarak yaşama şeklinizi kolaylaştırmak istiyoruz. Çünkü biz teknolojinin hayatınızı zorlaştırması değil, kolaylaştırması gerektiğine inanıyoruz. Ayrıca <strong>ŞIMART</strong> olarak müşterilerimize en üst düzeyde müşteri hizmeti sunmayı taahhüt etmekteyiz. Ürünlerimizden tamamen memnun kalmanız ve onlardan en iyi şekilde yararlanabilmeniz için gereken tüm desteği sağlamak istiyoruz. İlginiz için teşekkür ederiz. Bu ilginin karşılığını en güzel şekilde vermek ve sizin de hayatınızı daha akıllı ve kolay hale getirmek için sabırsızlıkla bekliyoruz.</p>",
            ],
        },
    ],
}

export default function BizKimizPage() {
    const organizationJsonLd = organizationSchema({
        url: `${siteConfig.site.url}/kurumsal/biz-kimiz`,
        description: metadata.description,
    });

    return (
        <>
            {/* Organization JSON-LD */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <AboutLayout currentSectionId="biz-kimiz">
                {/* Video Section */}
                <section className="mb-4">
                    <VideoSection />
                </section>

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
