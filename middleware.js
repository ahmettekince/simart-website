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

  if (pathnameIsMissingLocale) {
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