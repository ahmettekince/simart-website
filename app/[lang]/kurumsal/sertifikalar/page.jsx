
import { AboutLayout } from "@/components/about/about-layout"
import { CertificatesSection } from "@/components/about/certificates-section"
import { getCertificates } from "@/api/certificates";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    return {
        title: isEn ? "Certificates - Şımart Technology" : "Sertifikalar - Şımart Teknoloji",
        description: isEn ? "Discover our certificates..." : "Şımart Teknoloji'nin kazandığı sertifikalar hakkında bilgi edinin.",
    };
}

export default async function SertifikalarPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    const certificates = await getCertificates(lang);

    return (
        <AboutLayout currentSectionId="sertifikalar" lang={lang}>
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
                    {isEn ? "CERTIFICATES" : "SERTİFİKALAR"}
                </h1>
            </div>

            <CertificatesSection certificates={certificates} />
        </AboutLayout>
    )
}
