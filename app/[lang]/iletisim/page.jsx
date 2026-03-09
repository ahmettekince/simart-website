import Footer from "@/components/footers/Footer";
import Header from "@/components/headers/Header";
import ContactForm from "@/components/contact/ContactForm";
import Map from "@/components/contact/Map";
import React from "react";

export const metadata = {
    title: "İletişim - Şımart Teknoloji",
    description: "Şımart Teknoloji ile iletişime geçin. Akıllı ev sistemlerimizle ilgili tüm sorularınız için destek alın. Müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyar.",
};
export default function Contact() {
    return (
        <>
            <Header />
            <ContactForm />
            <Map />
        </>
    );
}
