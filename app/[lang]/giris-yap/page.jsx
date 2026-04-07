import Login from "@/components/othersPages/Login";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { lang } = params;
  
  if (lang === "en") {
    return {
      title: "Login - Şımart Teknoloji",
      description: "Şımart Teknoloji login page. Quickly access your account, manage your smart home products and personalize your user experience.",
      keywords: "Şımart Teknoloji Login, Şımart Membership Login, Smart Home System Login, Şımart Account Access, Şımart User Panel, Şımart Teknoloji Sign In, Smart Product Management, Şımart Online Login, Şımart Teknoloji Account, Şımart Login Page",
      authors: [{ name: "Şımart Teknoloji" }],
      openGraph: {
        title: "Login - Şımart Teknoloji",
        description: "Şımart Teknoloji login page. Quickly access your account, manage your smart home products and personalize your user experience.",
        url: "https://simart.me/en/login",
        locale: "en_US",
        type: "website",
      },
    };
  }

  return {
    title: "Oturum Aç - Şımart Teknoloji",
    description: "Şımart Teknoloji giriş sayfası. Hesabınıza hızlıca erişin, akıllı ev ürünlerinizi yönetin ve kullanıcı deneyiminizi kişiselleştirin.",
    keywords: "Şımart Teknoloji Giriş, Şımart Üyelik Girişi, Akıllı Ev Sistemi Giriş, Şımart Hesap Erişimi, Şımart Kullanıcı Paneli, Şımart Teknoloji Oturum Açma, Akıllı Ürün Yönetimi, Şımart Online Giriş, Şımart Teknoloji Hesap, Şımart Login Sayfası",
    authors: [{ name: "Şımart Teknoloji" }],
    openGraph: {
      title: "Oturum Aç - Şımart Teknoloji",
      description: "Şımart Teknoloji giriş sayfası. Hesabınıza hızlıca erişin, akıllı ev ürünlerinizi yönetin ve kullanıcı deneyiminizi kişiselleştirin.",
      url: "https://simart.me/giris-yap",
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
            url: "https://simart.me/giris-yap",
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
      <Login />
    </>
  );
}
