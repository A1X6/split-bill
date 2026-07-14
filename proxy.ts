import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic cookie-presence check only — real session validation happens
// server-side in layouts, pages, and server actions via requireUser().
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/bills");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!sessionCookie && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/bills/:path*", "/login", "/signup"],
};
