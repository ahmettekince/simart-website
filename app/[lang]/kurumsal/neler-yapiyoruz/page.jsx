
import { AboutLayout } from "@/components/about/about-layout"
import { ContentSection } from "@/components/about/content-section"
import { getSections } from "@/lib/about-data"

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    return {
        title: isEn ? "What We Do - Şımart Technology" : "Ne Yapıyoruz - Şımart Teknoloji",
        description: isEn ? "Learn what we do..." : "Şımart Teknoloji olarak yaşam alanlarınızı daha akıllı hale getiriyoruz.",
    };
}

export default async function NeYapiyoruzPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    const sectionData = getSections(lang).find(s => s.id === "neler-yapiyoruz") || { title: isEn ? "WHAT WE DO ?" : "NE YAPIYORUZ ?", contentBlocks: [] };

    return (
        <AboutLayout currentSectionId="neler-yapiyoruz" lang={lang}>
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
            <ContentSection section={sectionData} />
        </AboutLayout>
    )
}
