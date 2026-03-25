import { NextResponse } from "next/server";
import { i18n } from "./config/i18n";

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

  if (pathnameIsMissingLocale) {
    if (
      pathname.startsWith(`/${i18n.defaultLocale}/`) ||
      pathname === `/${i18n.defaultLocale}`
    ) {
      const newPathname =
        pathname.replace(`/${i18n.defaultLocale}`, "") || "/";
      response = NextResponse.redirect(new URL(newPathname, request.url));
    } else {
      response = NextResponse.rewrite(
        new URL(`/${i18n.defaultLocale}${pathname}`, request.url)
      );
    }
  } else {
    response = NextResponse.next();
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