import ContactForm from "@/components/contact/ContactForm";
import Map from "@/components/contact/Map";
import React from "react";

const translations = {
    tr: {
        title: "İletişim - Şımart Teknoloji",
        description: "Şımart Teknoloji ile iletişime geçin. Akıllı ev sistemlerimizle ilgili tüm sorularınız için destek alın. Müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyar.",
    },
    en: {
        title: "Contact - Şımart Technology",
        description: "Contact Şımart Technology. Get help for all your questions about our smart home systems. Our customer service is happy to assist you.",
    }
};

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const t = translations[lang] || translations.tr;
    return {
        title: t.title,
        description: t.description,
    };
}

export default async function Contact({ params }) {
    const { lang } = await params;
    return (
        <>
            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
                {lang === "en" ? "Şımart Technology Contact - Get in Touch" : "Şımart Teknoloji İletişim - Bize Ulaşın"}
            </h1>
            <ContactForm lang={lang} />
            <Map lang={lang} />
        </>
    );
}
