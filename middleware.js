import { NextResponse } from "next/server";
import { i18n } from "./config/i18n";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 0. API ve Statik Dosyaları Atla (Matcher'a ek olarak garanti olsun)
  if (
    pathname.startsWith("/api/") ||
    pathname === "/api" ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // 1. Affiliate/Ref Mantığı (Mevcut kodun)
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

  // 2. i18n Mantığı
  // Desteklenen dillerden birinin prefixi var mı kontrol et (varsayılan Dil hariç)
  const pathnameIsMissingLocale = i18n.locales
    .filter((locale) => locale !== i18n.defaultLocale)
    .every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

  // Eğer prefix yoksa (veya varsayılan dilden geliyorsa)
  if (pathnameIsMissingLocale) {
    // Kullanıcı manuel olarak /tr/... yazdıysa, prefixi silip yönlendir (SEO ve Prefixsiz TR kuralı için)
    if (pathname.startsWith(`/${i18n.defaultLocale}/`) || pathname === `/${i18n.defaultLocale}`) {
      const newPathname = pathname.replace(`/${i18n.defaultLocale}`, "") || "/";
      return NextResponse.redirect(new URL(newPathname, request.url));
    }

    // Prefix yoksa, arka planda /tr/... olarak REWRITE yap (URL değişmez, Next.js içerde [lang]=tr görür)
    return NextResponse.rewrite(
      new URL(`/${i18n.defaultLocale}${pathname}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
  ],
};
