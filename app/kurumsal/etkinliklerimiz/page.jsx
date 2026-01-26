import Header from "@/components/headers/Header"
import { AboutLayout } from "@/components/about/about-layout"
import { EventsSection } from "@/components/about/events-section"

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

const eventsData = [
    {
        title: "ZUCHEX 2025",
        subtitle: "35. Uluslararası Ev & Mutfak Eşyaları Fuarı",
        location: "ZUCHEX 2025",
        eventName: "35. Uluslararası Ev & Mutfak Eşyaları Fuarı",
        date: "11-14 Eylül 2025",
        link: "",
        image: "/images/events/zuchex.webp",
    },
    {
        title: "7. Verimlilik & Teknoloji Fuarı",
        subtitle: "\"Yapay Zeka Teknolojileri\" FUARI",
        location: "7. Verimlilik & Teknoloji Fuarı",
        eventName: "Gelecek İçin Teknolojiler",
        date: "24-27 Nisan 2025",
        link: "",
        image: "/images/events/fuar.jpg",
    },
    {
        title: "TEDx Acıbadem Üniversitesi",
        subtitle: "Pes Etme",
        location: "TEDx Acıbadem Üniversitesi",
        eventName: "Pes Etme",
        date: "26 Ekim 2024",
        link: "",
        image: "/images/events/tedx-acibadem.jpg",
    },
    {
        title: "Çankırı Eğitim Vakfı",
        subtitle: "Yapay Zeka ve Girişimcilik",
        location: "Çankırı Eğitim Vakfı",
        eventName: "Yapay Zeka ve Girişimcilik",
        date: "11 Şubat 2024",
        link: "",
        image: "/images/events/cankiri.jpg",
    },
    {
        title: "6. Verimlilik & Teknoloji Fuarı",
        subtitle: "Gelecek İçin Teknolojiler",
        location: "6. Verimlilik & Teknoloji Fuarı",
        eventName: "Gelecek İçin Teknolojiler",
        date: "6-8 Şubat 2024",
        link: "",
        image: "/images/events/fuar1.jpg",
    },
    {
        title: "Karabük Üniversitesi",
        subtitle: "IoT ve Girişimcilik",
        location: "Karabük Üniversitesi",
        eventName: "IoT ve Girişimcilik",
        date: "26 Aralık 2023",
        link: "",
        image: "/images/events/karabuk.jpg",
    },
    {
        title: "5. Verimlilik & Teknoloji Fuarı",
        subtitle: "Gelecek İçin Teknolojiler",
        location: "5. Verimlilik & Teknoloji Fuarı",
        eventName: "Gelecek İçin Teknolojiler",
        date: "2-4 Şubat 2023",
        link: "",
        image: "/images/events/fuar2.jpg",
    },
    {
        title: "Afyon Kocatepe Üniversitesi",
        subtitle: "Girişimcilik ve Yapay Zeka",
        location: "Afyon Kocatepe Üniversitesi",
        eventName: "Girişimcilik ve Yapay Zeka",
        date: "27 Aralık 2022",
        link: "",
        image: "/images/events/afyon.jpg",
    },
    {
        title: "Ufuk Üniversitesi",
        subtitle: "Web 3.0-Metaverse-Big Data",
        location: "Ufuk Üniversitesi",
        eventName: "Web 3.0-Metaverse-Big Data",
        date: "6 Aralık 2022",
        link: "",
        image: "/images/events/ufuk.jpg",
    },
    {
        title: "İstanbul Üniversitesi",
        subtitle: "Nesnelerin İnterneti ve Yapay Zeka",
        location: "İstanbul Üniversitesi",
        eventName: "Nesnelerin İnterneti ve Yapay Zeka",
        date: "1 Aralık 2022",
        link: "",
        image: "/images/events/istanbul.jpg",
    },
    {
        title: "TEDx Gazi Üniversitesi",
        subtitle: "Gelecekte Ne Tür Evlerde Yaşayacağız",
        location: "TEDx Gazi Üniversitesi",
        eventName: "Gelecekte Ne Tür Evlerde Yaşayacağız",
        date: "5 Kasım 2022",
        link: "",
        image: "/images/events/tedgazi.jpg",
    },
    {
        title: "Tokat Gaziosmanpaşa Üniversitesi",
        subtitle: "IoT-Metaverse-Web 3.0-Big Data",
        location: "Tokat Gaziosmanpaşa Üniversitesi",
        eventName: "IoT-Metaverse-Web 3.0-Big Data",
        date: "4-5 Kasım 2021",
        link: "",
        image: "/images/events/tokat.png",
    },
]

export default function EtkinliklerimizPage() {
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
