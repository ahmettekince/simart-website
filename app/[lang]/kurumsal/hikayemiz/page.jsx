import { AboutLayout } from "@/components/about/about-layout"
import { ContentSection } from "@/components/about/content-section"
import { getSections } from "@/lib/about-data"


export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    const title = isEn ? "Our Story - Şımart Technology" : "Hikayemiz - Şımart Teknoloji";

    return {
        title,
        description: isEn ? "Discover our story..." : "Şımart Teknoloji'nin kuruluş hikayesini keşfedin.",
        // ... alternates canonical ...
    };
}

export default async function HikayemizPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";

    return (
        <AboutLayout currentSectionId="hikayemiz" lang={lang}>
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
                    {isEn ? "OUR STORY" : "HİKAYEMİZ"}
                </h1>
            </div>

            <ContentSection section={getSections(lang).find(s => s.id === "hikayemiz")} />
        </AboutLayout>
    )
}
