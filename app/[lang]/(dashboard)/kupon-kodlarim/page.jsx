
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import Coupons from "@/components/othersPages/dashboard/Coupons";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

import { getLocalizedUrl } from "@/utils/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "My Coupons - Şımart Technology" : "Kupon Kodlarım - Robot Süpürge ve Akıllı Ev Sistemleri",
    description: isEn ? "View your discount coupons and check their status." : "Hesabınıza tanımlı indirim kuponlarını görüntüleyin.",
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
              <DashboardNav />
            </div>
            <div className="col-lg-9">
              <Coupons />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

