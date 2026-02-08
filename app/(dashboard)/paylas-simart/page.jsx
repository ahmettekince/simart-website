import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Paylaş Simart - Şımart Teknoloji",
  description: "Paylaş Simart sayfası. Simart'ı paylaşın ve kazanın.",
};
export default async function PaylasSimartPage() {
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}