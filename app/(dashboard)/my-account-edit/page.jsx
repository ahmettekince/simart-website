import Header from "@/components/headers/Header";
import AccountEdit from "@/components/othersPages/dashboard/AccountEdit";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Account Edit || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate React Nextjs Ecommerce Template",
};
export default async function page() {
  const isAuthenticated = await checkAuthServer();

  if (!isAuthenticated) {
    redirect("/giris-yap");
  }

  return (
    <>
      <Header />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">My Account Edit</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardNav />
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
