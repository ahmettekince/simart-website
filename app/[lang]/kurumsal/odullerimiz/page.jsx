
import { AboutLayout } from "@/components/about/about-layout"
import { AwardsSection } from "@/components/about/awards-section"

export const metadata = {
    title: "Ödüllerimiz - Şımart Teknoloji",
    description: "Şımart Teknoloji, A'Design Award'da Gümüş Ödül kazanarak, yerli tasarım robot süpürgesi 'Katya' ile ülkemizi gururlandırdı. Başarılarımızı keşfedin.",
    keywords: "Şımart Teknoloji, A'Design Award, Gümüş Ödül, Katya Robot Süpürge, Yerli Tasarım, Ürün Tasarımı, Türk Mühendislik, Ödüllerimiz, Tasarım Başarıları, Akıllı Ev Ürünleri",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Ödüllerimiz - Şımart Teknoloji",
        description: "Şımart Teknoloji, A'Design Award'da Gümüş Ödül kazanarak, yerli tasarım robot süpürgesi 'Katya' ile ülkemizi gururlandırdı. Başarılarımızı keşfedin.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/odullerimiz",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Ödüllerimiz - Şımart Teknoloji",
        description: "Şımart Teknoloji, A'Design Award'da Gümüş Ödül kazanarak, yerli tasarım robot süpürgesi 'Katya' ile ülkemizi gururlandırdı. Başarılarımızı keşfedin.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Ödüllerimiz - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji, A'Design Award'da Gümüş Ödül kazanarak, yerli tasarım robot süpürgesi 'Katya' ile ülkemizi gururlandırdı. Başarılarımızı keşfedin.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

const awardsData = [
    {
        title: "A'Design Award - Gümüş Ödül",
        content: [
            "Şımart Teknoloji, dünyanın en saygın tasarım ödüllerinden <strong>'A'Design Award'</strong> ürün tasarımı kategorisinde <strong>'Gümüş Ödül'</strong> kazandı.",
            "Türk mühendisleri tarafından tasarlanan \"katya\", Türkiye'nin yerli tasarım robot süpürgesidir.",
            "Bu ödüle layık görülerek, ülkemize bu gururu yaşatmamızı sağlayan tüm ekip arkadaşlarımıza ve işbirlikçilerimize teşekkür ederiz."
        ],
        image: "/images/awards/adesign-right.jpg",
        backgroundImage: "/images/awards/adesign-background.png",

    }
]

export default function OdullerimizPage() {
    return (
        <>
            <AboutLayout currentSectionId="odullerimiz">
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
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        ÖDÜLLERİMİZ
                    </h1>
                </div>

                {/* Content Area */}
                <AwardsSection awards={awardsData} />
            </AboutLayout>
        </>
    )
}
