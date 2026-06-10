import { NextResponse } from "next/server";
import { i18n, localizedRoutes } from "./config/i18n";

export async function middleware(request) {
  const url = request.nextUrl.clone();

  // 🔥 0. PATH NORMALIZATION (SAFE)
  const cleanPath = url.pathname.replace(/\/{2,}/g, "/");

  if (url.pathname !== cleanPath) {
    url.pathname = cleanPath;
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = url;

  // 🔥 0.5. KRİTİK ÜRÜN YÖNLENDİRMELERİ (Hızlı Erişim)
  const LEGACY_PRODUCT_REDIRECTS = {
    "/katya-u-akilli-robot-supurge": "/magaza/robotlar/katya-u-akilli-robot-supurge",
    "/katya-v-akilli-robot-supurge": "/magaza/robotlar/katya-v-akilli-robot-supurge",
    "/katya-v-plus-akilli-robot-supurge": "/magaza/robotlar/katya-v-plus-akilli-robot-supurge",
    "/6-hazneli-akilli-mama-kabi": "/magaza/evcil-canlilar/6-hazneli-akilli-mama-kabi",
    "/magaza/ev-aletleri/hava-nemlendirici": "/magaza/ev-aletleri/akilli-hava-nemlendirici",
    "/en/shop/ev-aletleri/hava-nemlendirici": "/en/shop/ev-aletleri/akilli-hava-nemlendirici",
    "/en/magaza/ev-aletleri/hava-nemlendirici": "/en/magaza/ev-aletleri/akilli-hava-nemlendirici",
    // 🤖 Robot Süpürge Yönlendirmeleri (/magaza/robotlar → /magaza/robot-supurge)
    "/magaza/robotlar": "/magaza/robot-supurge",
    "/en/shop/robots": "/en/shop/robot-vacuum-cleaner",
    "/magaza/robotlar/katya-uu-akilli-robot-supurge": "/magaza/robot-supurge/katya-uu-akilli-robot-supurge",
    "/magaza/robotlar/katya-v-plus-akilli-robot-supurge": "/magaza/robot-supurge/katya-v-plus-akilli-robot-supurge",
    "/magaza/robotlar/katya-v-akilli-robot-supurge": "/magaza/robot-supurge/katya-v-akilli-robot-supurge",
    "/magaza/robotlar/katyaz-akilli-robot-supurge": "/magaza/robot-supurge/katyaz-akilli-robot-supurge",
    "/magaza/robotlar/katya-p-akilli-robot-supurge": "/magaza/robot-supurge/katya-p-akilli-robot-supurge",
    "/magaza/robotlar/katya-u-akilli-robot-supurge": "/magaza/robot-supurge/katya-u-akilli-robot-supurge",
    "/magaza/robotlar/katya-t-akilli-robot-supurge": "/magaza/robot-supurge/katya-t-akilli-robot-supurge",
    // 🤖 EN Robot Vacuum Redirects (/en/shop/robots → /en/shop/robot-vacuum-cleaner)
    "/en/shop/robots/katya-uu-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-uu-smart-robot-vacuum",
    "/en/shop/robots/katya-v-plus-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-v-plus-smart-robot-vacuum",
    "/en/shop/robots/katya-v-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-v-smart-robot-vacuum",
    "/en/shop/robots/katyaz-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katyaz-smart-robot-vacuum",
    "/en/shop/robots/katya-p-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-p-smart-robot-vacuum",
    "/en/shop/robots/katya-u-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-u-smart-robot-vacuum",
    "/en/shop/robots/katya-t-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-t-smart-robot-vacuum",
    "/en/shop/robots/katya-smart-robot-vacuum": "/en/shop/robot-vacuum-cleaner/katya-smart-robot-vacuum",
    // 🪟 EN Window Cleaner Redirects (/en/shop/robots → /en/shop/window-cleaner-robots)
    "/en/shop/robots/square-window-cleaning-robot": "/en/shop/window-cleaner-robots/square-window-cleaning-robot",
    "/en/shop/robots/window-cleaner-robot-new-generation": "/en/shop/window-cleaner-robots/window-cleaner-robot-new-generation",
    "/en/shop/robots/window-cleaner-robot": "/en/shop/window-cleaner-robots/window-cleaner-robot",
    // 🪟 Cam Temizleme Robotu Yönlendirmeleri (/magaza/robotlar → /magaza/cam-temizleme-robotlari)
    "/magaza/robotlar/cam-temizleme-robotu-kare": "/magaza/cam-temizleme-robotlari/cam-temizleme-robotu-kare",
    "/magaza/robotlar/cam-temizleme-robotu-yeni-nesil": "/magaza/cam-temizleme-robotlari/cam-temizleme-robotu-yeni-nesil",
    "/magaza/robotlar/cam-temizleme-robotu": "/magaza/cam-temizleme-robotlari/cam-temizleme-robotu",

  };

  if (LEGACY_PRODUCT_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(LEGACY_PRODUCT_REDIRECTS[pathname], request.url), 301);
  }

  // 1. API ve statik skip
  if (
    pathname.startsWith("/api/") ||
    pathname === "/api" ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. i18n
  const pathnameIsMissingLocale = i18n.locales
    .filter((locale) => locale !== i18n.defaultLocale)
    .every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

  let response;
  let finalPathname = pathname;

  // 2.1 Localized Route mapping
  if (!pathnameIsMissingLocale && pathname.startsWith("/en/")) {
    const enRoutes = localizedRoutes.en;
    if (enRoutes) {
      // 1. Rewrite: /en/shop -> /en/magaza (Internal)
      Object.entries(enRoutes).forEach(([trSlug, enSlug]) => {
        if (pathname === `/en/${enSlug}`) {
          finalPathname = `/en/${trSlug}`;
        } else if (pathname.startsWith(`/en/${enSlug}/`)) {
          finalPathname = pathname.replace(`/en/${enSlug}/`, `/en/${trSlug}/`);
        }
      });

      // 2. Redirect: /en/magaza -> /en/shop (External)
      // Sadece finalPathname değişmediyse (yani hali hazırda shop gibi bir enSlug değilse) kontrol et
      if (finalPathname === pathname) {
        let shouldRedirect = false;
        let redirectPathname = pathname;
        Object.entries(enRoutes).forEach(([trSlug, enSlug]) => {
          if (pathname === `/en/${trSlug}`) {
            redirectPathname = `/en/${enSlug}`;
            shouldRedirect = true;
          } else if (pathname.startsWith(`/en/${trSlug}/`)) {
            redirectPathname = pathname.replace(`/en/${trSlug}/`, `/en/${enSlug}/`);
            shouldRedirect = true;
          }
        });

        if (shouldRedirect) {
          return NextResponse.redirect(new URL(redirectPathname, request.url), 301);
        }
      }
    }
  }

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

  if (pathnameIsMissingLocale) {
    // Eğer root'taysak (/) ve hatırlanan dil varsayılan dilden farklıysa yönlendir
    if (pathname === "/" && cookieLocale && cookieLocale !== i18n.defaultLocale && i18n.locales.includes(cookieLocale)) {
      return NextResponse.redirect(new URL(`/${cookieLocale}`, request.url));
    }

    if (
      pathname.startsWith(`/${i18n.defaultLocale}/`) ||
      pathname === `/${i18n.defaultLocale}`
    ) {
      const newPathname =
        pathname.replace(`/${i18n.defaultLocale}`, "") || "/";
      response = NextResponse.redirect(new URL(newPathname, request.url));
    } else {
      // Varsayılan dil ekle ve varsa eşlemesini yap
      let translatedPathname = `/${i18n.defaultLocale}${pathname}`;
      response = NextResponse.rewrite(
        new URL(translatedPathname, request.url)
      );
    }
  } else {
    // URL'de bir dil var, bu dili cookie'ye de işle (senkronizasyon)
    const urlLocale = pathname.split("/")[1];

    // 🔥 ÖNEMLİ: Çerez senkronizasyonunu sadece gerçek sayfa (HTML) isteklerinde yap.
    // Prefetch (ön yükleme) ve veri isteklerinin çerezi ezmesini engelle.
    const isHtmlRequest = request.headers.get("accept")?.includes("text/html");
    const isPrefetch = request.headers.get("purpose") === "prefetch" ||
      request.headers.get("x-purpose") === "prefetch" ||
      request.headers.get("x-next-purpose") === "prefetch" ||
      request.headers.get("next-router-prefetch") === "1";

    if (
      isHtmlRequest &&
      !isPrefetch &&
      urlLocale &&
      i18n.locales.includes(urlLocale) &&
      urlLocale !== cookieLocale
    ) {
      if (finalPathname !== pathname) {
        response = NextResponse.rewrite(new URL(finalPathname, request.url));
      } else {
        response = NextResponse.next();
      }
      response.cookies.set("NEXT_LOCALE", urlLocale, {
        maxAge: 31536000, // 1 yıl
        path: "/",
        sameSite: 'lax',
        secure: false
      });
      return response;
    }

    if (finalPathname !== pathname) {
      response = NextResponse.rewrite(new URL(finalPathname, request.url));
    } else {
      response = NextResponse.next();
    }
  }

  // 3. Affiliate
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref) {
    response.cookies.set("affiliate_ref", ref, {
      maxAge: 259200,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};