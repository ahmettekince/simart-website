import Header from "@/components/headers/Header";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import MyReviews from "@/components/othersPages/dashboard/MyReviews";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Değerlendirmelerim - Robot Süpürge ve Akıllı Ev Sistemleri",
  description: "Ürün ve sipariş değerlendirmelerinizi görüntüleyin.",
};

export default async function page() {
  const isAuthenticated = await checkAuthServer();

  if (!isAuthenticated) {
    redirect("/giris-yap");
  }

  return (
    <>
      <Header />

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
