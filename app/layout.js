import "../public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import ClientLayout from "@/components/common/ClientLayout";
import Topbar from "@/components/headers/Topbar";

//Api İstekleri
import { getTopbar } from "@/api/home";
import { getFooterMenus } from "@/api/menus";
import Footer from "@/components/footers/Footer";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: siteConfig.site.title,
  description: siteConfig.site.description,
  keywords: siteConfig.site.keywords,
  author: siteConfig.site.author,
  // og, twitter ve itemprop her sayfada ayrı tanımlanacak
};

export default async function RootLayout({ children }) {
  // Server-side veriler
  const [topbarData, footerMenus] = await Promise.all([
    getTopbar(),
    getFooterMenus(),
  ]);

  return (
    <html lang="tr">
      <body className="preload-wrapper">
        {/* Google reCaptcha (body içinde yükleniyor) */}
        <script src="https://www.google.com/recaptcha/api.js" async></script>
        <div className="preload preload-container" id="preloader">
          <div className="preload-logo">
            <div className="spinner"></div>
          </div>
        </div>
        <Topbar data={topbarData.data} isActive={topbarData.isActive} />
        <ClientLayout>
          {children}
        </ClientLayout>
        <Footer footerMenus={footerMenus} />
      </body>
    </html>
  );
}
