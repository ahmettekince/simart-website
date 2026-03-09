import Header from "@/components/headers/Header"
import { AboutLayout } from "@/components/about/about-layout"
import { PressSection } from "@/components/about/press-section"
import { webPageSchema } from "@/lib/schema"
import { siteConfig } from "@/config/site"
import { getPress } from "@/api/press";

export const metadata = {
    title: "Basında Biz - Şımart Teknoloji",
    description: "Şımart Teknoloji basın sayfasına hoş geldiniz. Akıllı ev sistemlerimiz hakkında en güncel haberleri, duyuruları ve basın görsellerini burada bulabilirsiniz. Şımart Teknoloji'nin sektördeki yeniliklerini ve başarı hikayelerini keşfedin.",
    keywords: "Şımart Teknoloji Basın, Şımart Teknoloji Haberler, Şımart Teknoloji Görseller, Akıllı Ev Sistemleri Basın, Şımart Basın Duyuruları, Şımart Basın Haberleri, Şımart Teknoloji Sektör Yenilikleri, Şımart Başarı Hikayeleri, Şımart Teknoloji Basın Sayfası",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Basında Biz - Şımart Teknoloji",
        description: "Şımart Teknoloji basın sayfasına hoş geldiniz. Akıllı ev sistemlerimiz hakkında en güncel haberleri, duyuruları ve basın görsellerini burada bulabilirsiniz. Şımart Teknoloji'nin sektördeki yeniliklerini ve başarı hikayelerini keşfedin.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/basinda-biz",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Basında Biz - Şımart Teknoloji",
        description: "Şımart Teknoloji basın sayfasına hoş geldiniz. Akıllı ev sistemlerimiz hakkında en güncel haberleri, duyuruları ve basın görsellerini burada bulabilirsiniz. Şımart Teknoloji'nin sektördeki yeniliklerini ve başarı hikayelerini keşfedin.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Basında Biz - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji basın sayfasına hoş geldiniz. Akıllı ev sistemlerimiz hakkında en güncel haberleri, duyuruları ve basın görsellerini burada bulabilirsiniz. Şımart Teknoloji'nin sektördeki yeniliklerini ve başarı hikayelerini keşfedin.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

export default async function BasindaBizPage() {
    const pressItems = await getPress();

    const pageJsonLd = webPageSchema({
        name: "Basında Biz - Şımart Teknoloji",
        url: `${siteConfig.site.url}/kurumsal/basinda-biz`,
        description: metadata.description,
    });

    return (
        <>
            {/* WebPage JSON-LD */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
            />
            <Header />
            <AboutLayout currentSectionId="basinda-biz">
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
                        BASINDA BİZ
                    </h1>
                </div>

                {/* Content Area */}
                <PressSection items={pressItems} />
            </AboutLayout>
        </>
    )
}
