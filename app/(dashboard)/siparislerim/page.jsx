import Header from "@/components/headers/Header";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import Orders from "@/components/othersPages/dashboard/Orders";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Siparişlerim - Şımart Teknoloji",
  description: "Şımart Teknoloji",
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
              <Orders />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
