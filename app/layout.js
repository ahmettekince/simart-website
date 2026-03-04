import "../public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import ClientLayout from "@/components/common/ClientLayout";

//Api İstekleri
import { getTopbar } from "@/api/home";
import { getFooterMenus } from "@/api/menus";
import ConditionalFooter from "@/components/common/ConditionalFooter";
import ConditionalTopbar from "@/components/common/ConditionalTopbar";
import { siteConfig } from "@/config/site";
import Script from "next/script";

export const metadata = {
  title: siteConfig.site.title,
  description: siteConfig.site.description,
  keywords: siteConfig.site.keywords,
  author: siteConfig.site.author,
  referrer: "strict-origin-when-cross-origin",
  // og, twitter ve itemprop her sayfada ayrı tanımlanacak
};

export default async function RootLayout({ children }) {
  // Server-side veriler
  const [topbarData, footerMenus] = await Promise.all([
    getTopbar(),
    getFooterMenus(),
  ]);

  const gtmId = siteConfig.site.tracking.gtm;

  return (
    <html lang="tr">
      <head>
        {/* Google Consent Mode v2 - Default Deny */}
        <Script
          id="google-consent-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'wait_for_update': 500
              });
              window.gtag = gtag;
            `,
          }}
        />
        {/* Google Tag Manager */}
        {gtmId && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
        )}
      </head>

      <body className="preload-wrapper">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TKCLRL3"
          height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <div className="preload preload-container" id="preloader">
          <div className="preload-logo">
            <div className="spinner"></div>
          </div>
        </div>
        <ConditionalTopbar data={topbarData.data} isActive={topbarData.isActive} />
        <ClientLayout>
          {children}
        </ClientLayout>
        <ConditionalFooter footerMenus={footerMenus} />
      </body>
    </html>
  );
}
