import "@/public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import ClientLayout from "@/components/common/ClientLayout";

//Api İstekleri
import { getTopbar } from "@/api/home";
import { getFooterMenus, getMenus } from "@/api/menus";
import ConditionalFooter from "@/components/common/ConditionalFooter";
import ConditionalTopbar from "@/components/common/ConditionalTopbar";
import ConditionalHeader from "@/components/common/ConditionalHeader";
import Header from "@/components/headers/Header";
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

import { i18n } from "@/config/i18n";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;

  // Server-side veriler
  const [topbarData, footerMenus, menuItems] = await Promise.all([
    getTopbar(lang),
    getFooterMenus(lang),
    getMenus(lang),
  ]);

  const gtmId = siteConfig.site.tracking.gtm;

  return (
    <html lang={lang || i18n.defaultLocale}>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TKCLRL3');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '529025925073486');
fbq('track', 'PageView');`,
          }}
        />
        {/* End Meta Pixel Code */}
      </head>

      <body className="preload-wrapper">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TKCLRL3"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Meta Pixel (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=529025925073486&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel (noscript) */}
        <div className="preload preload-container" id="preloader">
          <div className="preload-logo">
            <div className="spinner"></div>
          </div>
        </div>
        <ConditionalTopbar data={topbarData.data} isActive={topbarData.isActive} />
        <ConditionalHeader>
          <Header lang={lang} menuItems={menuItems} />
        </ConditionalHeader>
        <ClientLayout lang={lang}>
          {children}
        </ClientLayout>
        <ConditionalFooter footerMenus={footerMenus} lang={lang} />
      </body>
    </html>
  );
}
