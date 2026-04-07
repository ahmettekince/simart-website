
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import Orders from "@/components/othersPages/dashboard/Orders";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

import { getLocalizedUrl } from "@/utils/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "My Orders - Şımart Technology" : "Siparişlerim - Şımart Teknoloji",
    description: isEn ? "Şımart Technology My Orders" : "Şımart Teknoloji Siparişlerim",
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
              <Orders />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
