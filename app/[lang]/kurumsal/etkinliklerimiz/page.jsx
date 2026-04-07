import { AboutLayout } from "@/components/about/about-layout"
import { EventsSection } from "@/components/about/events-section"
import { getEvents } from "@/api/events";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    return {
        title: isEn ? "Our Events - Şımart Technology" : "Etkinliklerimiz - Şımart Teknoloji",
        description: isEn ? "Discover our events..." : "Şımart Teknoloji etkinlik ve katıldığımız fuarlar.",
    };
}

export default async function EtkinliklerimizPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    const eventsData = await getEvents();

    return (
        <>
            <AboutLayout currentSectionId="etkinliklerimiz" lang={lang}>
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
                        {isEn ? "OUR EVENTS" : "ETKİNLİKLERİMİZ"}
                    </h1>
                </div>

                {/* Content Area */}
                <EventsSection events={eventsData} />
            </AboutLayout>
        </>
    )
}
