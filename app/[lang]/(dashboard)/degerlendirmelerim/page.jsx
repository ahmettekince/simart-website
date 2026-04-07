
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import MyReviews from "@/components/othersPages/dashboard/MyReviews";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

import { getLocalizedUrl } from "@/utils/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "My Reviews - Şımart Technology" : "Değerlendirmelerim - Robot Süpürge ve Akıllı Ev Sistemleri",
    description: isEn ? "View your product and order reviews." : "Ürün ve sipariş değerlendirmelerinizi görüntüleyin.",
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
              <MyReviews />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
