import Header from "@/components/headers/Header";
import AccountEdit from "@/components/othersPages/dashboard/AccountEdit";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Hesabım - Robot Süpürge ve Akıllı Ev Sistemleri",
  description: "Şımart Teknoloji hesap yönetim paneli. Kişisel bilgilerinizi güncelleyin, siparişlerinizi görüntüleyin ve hesap ayarlarınızı yönetin.",

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
              <AccountEdit />
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
