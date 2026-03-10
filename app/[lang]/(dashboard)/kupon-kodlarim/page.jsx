
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import Coupons from "@/components/othersPages/dashboard/Coupons";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Kupon Kodlarım - Robot Süpürge ve Akıllı Ev Sistemleri",
  description:
    "Hesabınıza tanımlı indirim kuponlarını görüntüleyin, durumlarını kontrol edin ve uygun sepet tutarlarında kullanın.",
};

export default async function page() {
  const isAuthenticated = await checkAuthServer();

  if (!isAuthenticated) {
    redirect("/giris-yap");
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

