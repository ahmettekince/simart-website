
import { AboutLayout } from "@/components/about/about-layout"
import { AwardsSection } from "@/components/about/awards-section"

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    return {
        title: isEn ? "Our Awards - Şımart Technology" : "Ödüllerimiz - Şımart Teknoloji",
        description: isEn ? "Şımart Technology won the Silver Award at A'Design Award..." : "Şımart Teknoloji, A'Design Award'da Gümüş Ödül kazandı.",
    };
}

const awardsDataTr = [
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

const awardsDataEn = [
    {
        title: "A'Design Award - Silver Award",
        content: [
            "Şımart Technology won the <strong>'Silver Award'</strong> in the product design category of the <strong>'A'Design Award'</strong>, one of the world's most prestigious design awards.",
            "Designed by Turkish engineers, \"katya\" is Turkey's domestic design robot vacuum cleaner.",
            "We would like to thank all our teammates and collaborators who let us bring this pride to our country by being deemed worthy of this award."
        ],
        image: "/images/awards/adesign-right.jpg",
        backgroundImage: "/images/awards/adesign-background.png",
    }
]

export default async function OdullerimizPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";

    return (
        <AboutLayout currentSectionId="odullerimiz" lang={lang}>
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
                    {isEn ? "OUR AWARDS" : "ÖDÜLLERİMİZ"}
                </h1>
            </div>

            <AwardsSection awards={isEn ? awardsDataEn : awardsDataTr} />
        </AboutLayout>
    )
}
