
import ForgotPassword from "@/components/othersPages/ForgotPassword";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

const description = "Şımart Teknoloji Şifre Sıfırlama sayfası. Hesabınıza tekrar erişim sağlamak için şifrenizi kolayca sıfırlayın ve akıllı ev deneyiminize kaldığınız yerden devam edin.";

export const metadata = {
  title: "Şifremi Sıfırla - Şımart Teknoloji",
  description,
  keywords: "Şımart Teknoloji Şifremi Unuttum, Şımart Şifre Sıfırlama, Şımart Hesap Kurtarma, Şımart Üyelik Şifresi Yenileme, Şımart Teknoloji Şifre Yardımı, Akıllı Ev Sistemi Şifremi Unuttum, Şımart Şifre Yenileme, Şımart Login Şifre Sıfırlama",
  authors: [{ name: "Şımart Teknoloji" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Şifremi Sıfırla - Şımart Teknoloji",
    description,
    url: "https://simart.me/sifremi-unuttum",
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
    title: "Şifremi Sıfırla - Şımart Teknoloji",
    description,
    images: ["https://simart.me/uploads/systems/twitter.jpg"],
    creator: "@simartteknoloji",
    site: "@simartteknoloji",
  },
  other: {
    "itemprop:name": "Şifremi Sıfırla - Şımart Teknoloji",
    "itemprop:description": description,
    "itemprop:image": "https://simart.me/uploads/systems/seo.jpg",
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Şifremi Sıfırla - Şımart Teknoloji",
  url: "https://simart.me/sifremi-unuttum",
  description,
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: "https://simart.me/uploads/systems/logo.webp",
  },
  sameAs: [
    "https://www.instagram.com/simartteknoloji/",
    "https://www.facebook.com/simartteknoloji",
    "https://www.youtube.com/c/%C5%9E%C4%B1martTeknoloji",
    "https://x.com/simartteknoloji",
    "https://www.linkedin.com/company/%C5%9F%C4%B1mart-teknoloji/",
  ],
  contactPoint: [
    { "@type": "ContactPoint", telephone: "+90-552-642-8208", contactType: "Müşteri Hizmetleri" },
    { "@type": "ContactPoint", telephone: "+90-850-346-6126", contactType: "Müşteri Hizmetleri" },
  ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <ForgotPassword />
    </>
  );
}
