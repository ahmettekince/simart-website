import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

import AffiliateSection from "@/components/othersPages/dashboard/AffiliateSection";

import { getLocalizedUrl } from "@/utils/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "Share Şımart - Şımart Technology" : "Paylaş Şımart - Şımart Teknoloji",
    description: isEn ? "Share Şımart and win." : "Paylaş Şımart sayfası. Şımart'ı paylaşın ve kazanın.",
  };
}

export default async function PaylasSimartPage({ params }) {
  const { lang } = await params;
  const isAuthenticated = await checkAuthServer();

  if (!isAuthenticated) {
    redirect(getLocalizedUrl("/giris-yap", lang));
  }

  return (
    <>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardNav />
            </div>
            <div className="col-lg-9">
              <AffiliateSection />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}