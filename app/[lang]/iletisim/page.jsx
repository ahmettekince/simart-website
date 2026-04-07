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
            <ContactForm lang={lang} />
            <Map lang={lang} />
        </>
    );
}
