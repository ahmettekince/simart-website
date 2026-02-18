import Header from "@/components/headers/Header";
import AccountAddress from "@/components/othersPages/dashboard/AccountAddress";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Adreslerim || Şımart Teknoloji",
  description: "Şımart Teknoloji ",
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
              <AccountAddress />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
