import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";
import Header from "@/components/headers/Header";
import AffiliateSection from "@/components/othersPages/dashboard/AffiliateSection";

export const metadata = {
  title: "Paylaş Şımart - Şımart Teknoloji",
  description: "Paylaş Şımart sayfası. Şımart'ı paylaşın ve kazanın.",
};
export default async function PaylasSimartPage() {
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
              <AffiliateSection />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}