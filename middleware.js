import { NextResponse } from "next/server";


export async function middleware(request) {
  const response = NextResponse.next();
  const url = new URL(request.url);

  const ref = url.searchParams.get("ref");

  if (request.url.includes("ref")) {
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|fonts|images|css|scss|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\..*).*)",
  ],
};
