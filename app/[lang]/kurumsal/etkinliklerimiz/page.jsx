import Header from "@/components/headers/Header"
import { AboutLayout } from "@/components/about/about-layout"
import { EventsSection } from "@/components/about/events-section"
import { getEvents } from "@/api/events";

export const metadata = {
    title: "Etkinliklerimiz - Şımart Teknoloji",
    description: "Şımart Teknoloji'nin düzenlediği etkinlikler, seminerler ve sosyal sorumluluk projeleri hakkında bilgi alın. Yenilikçi çözümlerimizle topluma katkıda bulunuyoruz.",
    keywords: "Şımart Teknoloji, Etkinlikler, Seminerler, Sosyal Sorumluluk Projeleri, Teknoloji Etkinlikleri, Yenilikçi Çözümler, Topluma Katkı, Şımart Etkinlik Takvimi, Eğitim Programları",
    author: "Şımart Teknoloji",
    robots: "index, follow",
    og: {
        title: "Etkinliklerimiz - Şımart Teknoloji",
        description: "Şımart Teknoloji'nin düzenlediği etkinlikler, seminerler ve sosyal sorumluluk projeleri hakkında bilgi alın. Yenilikçi çözümlerimizle topluma katkıda bulunuyoruz.",
        image: "https://simart.me/uploads/systems/og.jpg",
        url: "https://simart.me/kurumsal/etkinliklerimiz",
        type: "website",
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Etkinliklerimiz - Şımart Teknoloji",
        description: "Şımart Teknoloji'nin düzenlediği etkinlikler, seminerler ve sosyal sorumluluk projeleri hakkında bilgi alın. Yenilikçi çözümlerimizle topluma katkıda bulunuyoruz.",
        image: "https://simart.me/uploads/systems/twitter.jpg",
        site: "@simartteknoloji",
        creator: "@simartteknoloji",
    },
    other: {
        "itemprop:name": "Etkinliklerimiz - Şımart Teknoloji",
        "itemprop:description": "Şımart Teknoloji'nin düzenlediği etkinlikler, seminerler ve sosyal sorumluluk projeleri hakkında bilgi alın. Yenilikçi çözümlerimizle topluma katkıda bulunuyoruz.",
        "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
    },
}

export default async function EtkinliklerimizPage() {
    const eventsData = await getEvents();

    return (
        <>
            <Header />
            <AboutLayout currentSectionId="etkinliklerimiz">
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
                        ETKİNLİKLERİMİZ
                    </h1>
                </div>

                {/* Content Area */}
                <EventsSection events={eventsData} />
            </AboutLayout>
        </>
    )
}
