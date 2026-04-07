
import { AboutLayout } from "@/components/about/about-layout"
import { VideoSection } from "@/components/about/video-section"
import { ContentSection } from "@/components/about/content-section"
import { organizationSchema } from "@/lib/schema"
import { siteConfig } from "@/config/site"


export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";

    const title = isEn ? "Who We Are? - Şımart Technology" : "Biz Kimiz? - Şımart Teknoloji";
    const description = isEn
        ? "Şımart Technology, as a leading brand in smart home solutions, makes your living spaces smarter with our innovative products and customer-oriented service. Who we are? Meet us."
        : "Şımart Teknoloji, akıllı ev çözümleri alanında öncü bir marka olarak, yenilikçi ürünlerimiz ve müşteri odaklı hizmet anlayışımızla yaşam alanlarınızı daha akıllı hale getiriyoruz. Biz kimiz? Bizimle tanışın.";

    return {
        title,
        description,
        keywords: isEn
            ? "Şımart Technology, Corporate, Smart Home Solutions, Innovative Products, Customer Oriented Service, About Şımart Technology"
            : "Şımart Teknoloji, Kurumsal, Akıllı Ev Çözümleri, Yenilikçi Ürünler, Müşteri Odaklı Hizmet, Şımart Teknoloji Hakkında",
        author: isEn ? "Şımart Technology" : "Şımart Teknoloji",
        robots: "index, follow",
        alternates: {
            canonical: isEn ? "https://simart.me/en/corporate/who-we-are" : "https://simart.me/kurumsal/biz-kimiz",
        },
        og: {
            title,
            description,
            image: "https://simart.me/uploads/systems/og.jpg",
            url: isEn ? "https://simart.me/en/corporate/who-we-are" : "https://simart.me/kurumsal/biz-kimiz",
            type: "website",
            locale: isEn ? "en_US" : "tr_TR",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            image: "https://simart.me/uploads/systems/twitter.jpg",
            site: "@simartteknoloji",
            creator: "@simartteknoloji",
        },
    };
}

const sectionDataEn = {
    id: "biz-kimiz",
    title: "WHO WE ARE ?",
    contentBlocks: [
        {
            paragraphs: [
                "<p><strong>SIMART</strong> is a technology company founded by Turkish engineers, operating in the field of smart home systems and IoT solutions. Our mission is to develop and offer innovative technological products that simplify and enrich your daily life.</p>",
                "<p>We offer a wide range of products including smart home systems, robot vacuums, security systems, and health tracking devices. Our products are specially designed and manufactured specifically for the needs of Turkish households.</p>",
                "<p><strong>Our goal is very clear:</strong> We want to simplify your way of living by offering easy-to-use and smart solutions that integrate seamlessly into your daily routines. Because we believe that technology should make your life easier, not harder. Additionally, as <strong>SIMART</strong>, we are committed to providing the highest level of customer service to our customers. We want to provide all the support you need so that you are completely satisfied with our products and can make the most of them. Thank you for your interest. We look forward to rewarding this interest in the best way possible and making your life smarter and easier.</p>",
            ],
        },
    ],
};

const sectionDataTr = {
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
};

export default async function BizKimizPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    const sectionData = isEn ? sectionDataEn : sectionDataTr;

    const organizationJsonLd = organizationSchema({
        url: isEn ? `${siteConfig.site.url}/en/corporate/who-we-are` : `${siteConfig.site.url}/kurumsal/biz-kimiz`,
        description: isEn ? "Şımart Technology Who We Are Page" : "Şımart Teknoloji Biz Kimiz Sayfası",
    });

    return (
        <>
            {/* Organization JSON-LD */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <AboutLayout currentSectionId="biz-kimiz" lang={lang}>
                {/* Video Section */}
                <section className="mb-4">
                    <VideoSection lang={lang} />
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
