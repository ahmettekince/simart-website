
import { AboutLayout } from "@/components/about/about-layout"
import { CareerSection } from "@/components/about/career-section"

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";
    return {
        title: isEn ? "Careers - Şımart Technology" : "Kariyer - Şımart Teknoloji",
        description: isEn ? "Join our team..." : "Şımart Teknoloji kariyer sayfasına hoş geldiniz.",
    };
}

const careerFAQs = [
    {
        title: "İnovasyonun Kalbindeyiz",
        content: "Şımart Teknoloji olarak, inovasyonun kalbinde yer alarak geleceğin teknolojilerini geliştirmek için çalışıyoruz. Sektördeki en yeni ve ileri teknolojileri yakından takip ediyor, kullanıcılarımızın ihtiyaçlarını karşılayacak yaratıcı ve yenilikçi çözümler sunuyoruz. Yeniliği bir kültür haline getirip sürekli olarak daha iyi ürünler ve hizmetler sunma arzusuyla, çalışanlarımızı da bu yolculuğun bir parçası yapıyoruz."
    },
    {
        title: "Birlikte Büyümek",
        content: "Şımart Teknoloji’de, başarıya giden yolun takım çalışmasından geçtiğine inanıyoruz. Her bir çalışanımızın bireysel gelişimine önem veriyor, ortak hedefler doğrultusunda birlikte büyüyoruz. Takım ruhu, iş birliği ve güçlü iletişimle daha büyük başarılara imza atarken, her bir bireyin katkısını değerli kılıyoruz. Şımart Teknoloji ailesine katılarak, sadece bir iş değil, kariyerinizde anlamlı bir yolculuk yaşayacaksınız."
    },
    {
        title: "Kariyerinizi şekillendirin",
        content: "Şımart Teknoloji’de, kariyerinizin kontrolü sizde. Kendi potansiyelinizi keşfetmenizi ve profesyonel hedeflerinizi gerçekleştirmenizi sağlayacak fırsatlar sunuyoruz. Yalnızca iş değil, kişisel gelişim ve kariyer yolculuğunda her adımda yanınızdayız. Dinamik bir çalışma ortamında, yenilikçi projelerde yer alarak kariyerinizi şekillendirin ve gelecekteki başarılarınızın temelini burada atın."
    },
]

const careerFAQsEn = [
    {
        title: "At the Heart of Innovation",
        content: "At Şımart Technology, we work at the heart of innovation to develop the technologies of the future. We closely follow the latest and most advanced technologies in the industry and offer creative and innovative solutions that satisfy our users' needs. By making innovation a culture and with the desire to constantly offer better products and services, we make our employees part of this journey."
    },
    {
        title: "Growing Together",
        content: "At Şımart Technology, we believe that the path to success lies in teamwork. We value the individual development of each of our employees and grow together toward common goals. While achieving greater success with team spirit, cooperation, and strong communication, we value the contribution of each individual. By joining the Şımart Technology family, you will experience not just a job, but a meaningful journey in your career."
    },
    {
        title: "Shape Your Career",
        content: "At Şımart Technology, you are in control of your career. We offer opportunities that allow you to explore your own potential and achieve your professional goals. We are with you every step of the way, not only in terms of work but also in your personal growth and career journey. Shape your career by taking part in innovative projects in a dynamic work environment and lay the foundation for your future success here."
    },
]

export default async function KariyerPage({ params }) {
    const { lang } = await params;
    const isEn = lang === "en";

    return (
        <AboutLayout currentSectionId="kariyer" lang={lang}>
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
                    {isEn ? "CAREERS" : "KARİYER"}
                </h1>
            </div>

            {/* Content Area */}
            <CareerSection faqs={isEn ? careerFAQsEn : careerFAQs} lang={lang} />
        </AboutLayout>
    )
}
