import Header from "@/components/headers/Header";
import Login from "@/components/othersPages/Login";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Oturum Aç - Şımart Teknoloji",
  description: "Şımart Teknoloji giriş sayfası. Hesabınıza hızlıca erişin, akıllı ev ürünlerinizi yönetin ve kullanıcı deneyiminizi kişiselleştirin.",
  keywords: "Şımart Teknoloji Giriş, Şımart Üyelik Girişi, Akıllı Ev Sistemi Giriş, Şımart Hesap Erişimi, Şımart Kullanıcı Paneli, Şımart Teknoloji Oturum Açma, Akıllı Ürün Yönetimi, Şımart Online Giriş, Şımart Teknoloji Hesap, Şımart Login Sayfası",
  authors: [{ name: "Şımart Teknoloji" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Oturum Aç - Şımart Teknoloji",
    description: "Şımart Teknoloji giriş sayfası. Hesabınıza hızlıca erişin, akıllı ev ürünlerinizi yönetin ve kullanıcı deneyiminizi kişiselleştirin.",
    url: "https://simart.me/giris-yap",
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
    title: "Oturum Aç - Şımart Teknoloji",
    description: "Şımart Teknoloji giriş sayfası. Hesabınıza hızlıca erişin, akıllı ev ürünlerinizi yönetin ve kullanıcı deneyiminizi kişiselleştirin.",
    images: ["https://simart.me/uploads/systems/twitter.jpg"],
    creator: "@simartteknoloji",
    site: "@simartteknoloji",
  },
  other: {
    "itemprop:name": "Oturum Aç - Şımart Teknoloji",
    "itemprop:description": "Şımart Teknoloji giriş sayfası. Hesabınıza hızlıca erişin, akıllı ev ürünlerinizi yönetin ve kullanıcı deneyiminizi kişiselleştirin.",
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
      <Header />
      <Login />
    </>
  );
}
