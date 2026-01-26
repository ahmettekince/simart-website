import { NextResponse } from "next/server";


export async function middleware(request) {
  const response = NextResponse.next();

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
    "/((?!api|_next/static|_next/image|fonts|images|css|scss|favicon.ico).*)",
  ],
};
