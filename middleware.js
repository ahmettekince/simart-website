import { NextResponse } from "next/server";

// Özel URL mapping'ler (Türkçe -> İngilizce)

export function middleware(request) {
  // const response = NextResponse.next();
  // const deviceId = request.cookies.get("DEVICE_ID");

  // if (!deviceId) {
  //     const randomValues = crypto.getRandomValues(new Uint8Array(16));
  //     const newDeviceId = btoa(String.fromCharCode(...randomValues));

  //     response.cookies.set("DEVICE_ID", newDeviceId, {
  //         httpOnly: true,
  //         path: "/",
  //         maxAge: 60 * 60 * 24 * 365, // 1 year
  //         sameSite: "lax",
  //     });
  // }

  // return response;
  const response = NextResponse.next();
  response.cookies.set("DEVICE_ID", process.env.DEVICE_ID, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
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
