import Header from "@/components/headers/Header";
import Register from "@/components/othersPages/Register";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Kayıt Ol - Şımart Teknoloji",
  description: "Şımart Teknoloji'ye kayıt olun. Akıllı ev sistemlerimizle hayatınızı kolaylaştırın ve üyelik ayrıcalıklarından yararlanın.",
  keywords: "Şımart Teknoloji Kayıt, Akıllı Ev Sistemleri Üyelik, Şımart Hesap Oluşturma, Şımart Üyelik Avantajları, Şımart Üye Ol, Şımart Teknoloji Üyelik Girişi, Şımart Akıllı Cihaz Üyeliği, Şımart Üyelik Kaydı, Şımart Teknoloji Kayıt Ol",
  authors: [{ name: "Şımart Teknoloji" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Kayıt Ol - Şımart Teknoloji",
    description: "Şımart Teknoloji'ye kayıt olun. Akıllı ev sistemlerimizle hayatınızı kolaylaştırın ve üyelik ayrıcalıklarından yararlanın.",
    url: "https://simart.me/kayit-ol",
    siteName: "Şımart Teknoloji",
    images: [
      {
        url: "https://simart.me/uploads/systems/og.jpg",
        width: 1200,
        height: 630,
        alt: "Şımart Teknoloji",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kayıt Ol - Şımart Teknoloji",
    description: "Şımart Teknoloji'ye kayıt olun. Akıllı ev sistemlerimizle hayatınızı kolaylaştırın ve üyelik ayrıcalıklarından yararlanın.",
    images: ["https://simart.me/uploads/systems/twitter.jpg"],
    creator: "@simartteknoloji",
    site: "@simartteknoloji",
  },
  other: {
    "itemprop:name": "Kayıt Ol - Şımart Teknoloji",
    "itemprop:description": "Şımart Teknoloji'ye kayıt olun. Akıllı ev sistemlerimizle hayatınızı kolaylaştırın ve üyelik ayrıcalıklarından yararlanın.",
    "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
  },
};
export default async function page() {
  const isAuthenticated = await checkAuthServer();

  if (isAuthenticated) {
    redirect("/hesabim");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
            url: "https://simart.me/kayit-ol",
            logo: "https://simart.me/uploads/systems/logo.webp",
            description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
            sameAs: [
              "https://www.instagram.com/simartteknoloji/",
              "https://www.facebook.com/simartteknoloji",
              "https://www.youtube.com/c/%C5%9E%C4%B1martTeknoloji",
              "https://x.com/simartteknoloji",
              "https://www.linkedin.com/company/%C5%9F%C4%B1mart-teknoloji/",
            ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+90-552-642-8208",
                contactType: "Müşteri Hizmetleri",
              },
              {
                "@type": "ContactPoint",
                telephone: "+90-850-346-6126",
                contactType: "Müşteri Hizmetleri",
              },
            ],
          }),
        }}
      />
      <Header />
      <Register />
    </>
  );
}
