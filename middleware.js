import { NextResponse } from "next/server";
import { i18n } from "./config/i18n";

export async function middleware(request) {
  const url = request.url;
  const origin = request.nextUrl.origin;
  const pathWithSearch = url.slice(origin.length);

  // 0. URL Normalizasyonu: Çift bölü (//) işaretlerini temizle (SecurityError engelleyici)
  // Domain'den hemen sonra // geliyorsa veya path içinde // varsa yakala
  if (pathWithSearch.startsWith("//") || pathWithSearch.includes("//")) {
    const cleanPathWithSearch = pathWithSearch.replace(/\/+/g, "/");
    const redirectUrl = new URL(cleanPathWithSearch, origin);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  const { pathname } = request.nextUrl;
  const { search } = request.nextUrl;

  // 1. API ve Statik Dosyaları Atla (Matcher'a ek olarak garanti olsun)
  if (
    pathname.startsWith("/api/") ||
    pathname === "/api" ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. i18n Mantığına Göre İlk Response'u Belirle
  const pathnameIsMissingLocale = i18n.locales
    .filter((locale) => locale !== i18n.defaultLocale)
    .every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

  let response;

  if (pathnameIsMissingLocale) {
    // Kullanıcı manuel olarak /tr/... yazdıysa, prefixi silip yönlendir (SEO ve Prefixsiz TR kuralı için)
    if (pathname.startsWith(`/${i18n.defaultLocale}/`) || pathname === `/${i18n.defaultLocale}`) {
      const newPathname = pathname.replace(`/${i18n.defaultLocale}`, "") || "/";
      response = NextResponse.redirect(new URL(newPathname, request.url));
    } else {
      // Prefix yoksa, arka planda /tr/... olarak REWRITE yap
      response = NextResponse.rewrite(
        new URL(`/${i18n.defaultLocale}${pathname}`, request.url)
      );
    }
  } else {
    response = NextResponse.next();
  }

  // 2. Affiliate/Ref Mantığı
  // Belirlenen nihai response (next, redirect veya rewrite) üzerinden çerezi set et
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref) {
    response.cookies.set("affiliate_ref", ref, {
      maxAge: 259200, // 3 gün
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
  ],
};
