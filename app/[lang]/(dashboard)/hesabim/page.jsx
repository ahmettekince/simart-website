
import AccountEdit from "@/components/othersPages/dashboard/AccountEdit";
import AccountProfileSection from "@/components/othersPages/dashboard/AccountProfileSection";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

import { getLocalizedUrl } from "@/utils/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "My Account - Şımart Technology" : "Hesabım - Robot Süpürge ve Akıllı Ev Sistemleri",
    description: isEn ? "Şımart Technology account management panel." : "Şımart Teknoloji hesap yönetim paneli.",
  };
}

export default async function page({ params }) {
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
              <DashboardNav profileSection={<AccountProfileSection />} />
            </div>
            <div className="col-lg-9">
              <AccountEdit />
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
