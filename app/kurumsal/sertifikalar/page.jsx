import Header from "@/components/headers/Header"
import { AboutLayout } from "@/components/about/about-layout"
import { CertificatesSection } from "@/components/about/certificates-section"

export const metadata = {
    title: "Sertifikalar - Şımart Teknoloji",
    description: "Şımart Teknoloji'nin kalite, güvenlik ve çevreye duyarlılık alanlarında kazandığı sertifikalar hakkında bilgi edinin. Güvenilir ve yenilikçi çözümlerimizle tanışın.",
    keywords: "Şımart Teknoloji, Sertifikalar, Kalite Sertifikası, Güvenlik Sertifikası, Çevre Sertifikası, Güvenilir Teknoloji, Şımart Kalite, Akıllı Ev Çözümleri, Yenilikçi Teknoloji, Kalite Belgeleri",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Sertifikalar - Şımart Teknoloji",
        description: "Şımart Teknoloji'nin kalite, güvenlik ve çevreye duyarlılık alanlarında kazandığı sertifikalar hakkında bilgi edinin. Güvenilir ve yenilikçi çözümlerimizle tanışın.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/sertifikalar",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sertifikalar - Şımart Teknoloji",
        description: "Şımart Teknoloji'nin kalite, güvenlik ve çevreye duyarlılık alanlarında kazandığı sertifikalar hakkında bilgi edinin. Güvenilir ve yenilikçi çözümlerimizle tanışın.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Sertifikalar - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji'nin kalite, güvenlik ve çevreye duyarlılık alanlarında kazandığı sertifikalar hakkında bilgi edinin. Güvenilir ve yenilikçi çözümlerimizle tanışın.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

const certificates = [
    {
        id: 1,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert1.webp",
    },
    {
        id: 2,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert2.webp",
    },
    {
        id: 3,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert3.webp",
    },
    {
        id: 4,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert4.webp",
    },
    {
        id: 5,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert5.webp",
    },
    {
        id: 6,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert6.webp",
    },
    {
        id: 7,
        title: "Sertifikalar - Şımart Teknoloji",
        imageUrl: "/images/certificates/cert7.webp",
    },
]

export default function SertifikalarPage() {
    return (
        <>
            <Header />
            <AboutLayout currentSectionId="sertifikalar">
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
                        SERTİFİKALAR
                    </h1>
                </div>

                {/* Content Area */}
                <CertificatesSection certificates={certificates} />
            </AboutLayout>
        </>
    )
}
