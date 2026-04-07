import Register from "@/components/othersPages/Register";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { lang } = params;
  
  if (lang === "en") {
    return {
      title: "Register - Şımart Teknoloji",
      description: "Sign up for Şımart Teknoloji. Simplify your life with our smart home systems and benefit from membership privileges.",
      keywords: "Şımart Teknoloji Register, Smart Home Systems Membership, Şımart Account Creation, Şımart Membership Benefits, Şımart Sign Up, Şımart Teknoloji Membership Login, Şımart Smart Device Membership, Şımart Membership Registration",
      authors: [{ name: "Şımart Teknoloji" }],
      openGraph: {
        title: "Register - Şımart Teknoloji",
        description: "Sign up for Şımart Teknoloji. Simplify your life with our smart home systems and benefit from membership privileges.",
        url: "https://simart.me/en/register",
        locale: "en_US",
        type: "website",
      },
    };
  }

  return {
    title: "Kayıt Ol - Şımart Teknoloji",
    description: "Şımart Teknoloji'ye kayıt olun. Akıllı ev sistemlerimizle hayatınızı kolaylaştırın ve üyelik ayrıcalıklarından yararlanın.",
    keywords: "Şımart Teknoloji Kayıt, Akıllı Ev Sistemleri Üyelik, Şımart Hesap Oluşturma, Şımart Üyelik Avantajları, Şımart Üye Ol, Şımart Teknoloji Üyelik Girişi, Şımart Akıllı Cihaz Üyeliği, Şımart Üyelik Kaydı, Şımart Teknoloji Kayıt Ol",
    authors: [{ name: "Şımart Teknoloji" }],
    openGraph: {
      title: "Kayıt Ol - Şımart Teknoloji",
      description: "Şımart Teknoloji'ye kayıt olun. Akıllı ev sistemlerimizle hayatınızı kolaylaştırın ve üyelik ayrıcalıklarından yararlanın.",
      url: "https://simart.me/kayit-ol",
      locale: "tr_TR",
      type: "website",
    },
  };
}

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
      <Register />
    </>
  );
}
