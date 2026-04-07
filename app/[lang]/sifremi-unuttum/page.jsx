import ForgotPassword from "@/components/othersPages/ForgotPassword";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { lang } = params;
  
  if (lang === "en") {
    const description = "Şımart Teknoloji Password Reset page. Easily reset your password to regain access to your account and continue your smart home experience from where you left off.";
    return {
      title: "Reset Password - Şımart Teknoloji",
      description,
      keywords: "Şımart Teknoloji Forgot Password, Şımart Password Reset, Şımart Account Recovery, Şımart Membership Password Renewal, Şımart Teknoloji Password Help, Smart Home System Forgot Password, Şımart Password Renewal, Şımart Login Password Reset",
      authors: [{ name: "Şımart Teknoloji" }],
      openGraph: {
        title: "Reset Password - Şımart Teknoloji",
        description,
        url: "https://simart.me/en/forgot-password",
        locale: "en_US",
        type: "website",
      },
    };
  }

  const description = "Şımart Teknoloji Şifre Sıfırlama sayfası. Hesabınıza tekrar erişim sağlamak için şifrenizi kolayca sıfırlayın ve akıllı ev deneyiminize kaldığınız yerden devam edin.";
  return {
    title: "Şifremi Sıfırla - Şımart Teknoloji",
    description,
    keywords: "Şımart Teknoloji Şifremi Unuttum, Şımart Şifre Sıfırlama, Şımart Hesap Kurtarma, Şımart Üyelik Şifresi Yenileme, Şımart Teknoloji Şifre Yardımı, Akıllı Ev Sistemi Şifremi Unuttum, Şımart Şifre Yenileme, Şımart Login Şifre Sıfırlama",
    authors: [{ name: "Şımart Teknoloji" }],
    openGraph: {
      title: "Şifremi Sıfırla - Şımart Teknoloji",
      description,
      url: "https://simart.me/sifremi-unuttum",
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
      <ForgotPassword />
    </>
  );
}
