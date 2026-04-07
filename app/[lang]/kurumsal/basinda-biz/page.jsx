
import { AboutLayout } from "@/components/about/about-layout"
import { PressSection } from "@/components/about/press-section"
import { webPageSchema } from "@/lib/schema"
import { siteConfig } from "@/config/site"
import { getPress } from "@/api/press";


export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";

    const title = isEn ? "Press - Şımart Technology" : "Basında Biz - Şımart Teknoloji";
    const description = isEn
        ? "Welcome to Şımart Technology press page. Discover our latest news, announcements and press images about our smart home systems."
        : "Şımart Teknoloji basın sayfasına hoş geldiniz. Akıllı ev sistemlerimiz hakkında en güncel haberleri, duyuruları ve basın görsellerini burada bulabilirsiniz.";

    return {
        title,
        description,
        keywords: isEn
            ? "Şımart Technology Press, News, Announcements, Smart Home Press"
            : "Şımart Teknoloji Basın, Haberler, Duyurular, Akıllı Ev Sistemleri Basın",
        author: isEn ? "Şımart Technology" : "Şımart Teknoloji",
        robots: "index, follow",
        alternates: {
            canonical: isEn ? "https://simart.me/en/corporate/press" : "https://simart.me/kurumsal/basinda-biz",
        },
        og: {
            title,
            description,
            image: "https://simart.me/uploads/systems/og.jpg",
            url: isEn ? "https://simart.me/en/corporate/press" : "https://simart.me/kurumsal/basinda-biz",
            type: "website",
            locale: isEn ? "en_US" : "tr_TR",
        },
    };
}

export default async function BasindaBizPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    const pressItems = await getPress(lang);

    const pageJsonLd = webPageSchema({
        name: isEn ? "Press - Şımart Technology" : "Basında Biz - Şımart Teknoloji",
        url: isEn ? `${siteConfig.site.url}/en/corporate/press` : `${siteConfig.site.url}/kurumsal/basinda-biz`,
        description: isEn ? "Şımart Technology Press Page" : "Şımart Teknoloji Basın Sayfası",
    });

    return (
        <>
            {/* WebPage JSON-LD */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
            />
            <AboutLayout currentSectionId="basinda-biz" lang={lang}>
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
                        {isEn ? "PRESS" : "BASINDA BİZ"}
                    </h1>
                </div>

                {/* Content Area */}
                <PressSection items={pressItems} lang={lang} />
            </AboutLayout>
        </>
    )
}
