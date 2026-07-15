import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic cookie check to keep signed-out visitors off app routes without a
 * database round trip. Real validation happens in requireUser().
 *
 * It deliberately does NOT bounce cookie holders away from /login: a cookie can
 * be stale (expired, revoked, user deleted), and trusting it here would fight
 * requireUser()'s redirect back to /login and trap the user in a redirect loop.
 * The login and signup pages check the real session server-side instead.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Keep this list in sync with config.matcher below — both must name every
  // protected prefix, or a route is silently unguarded at the edge.
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/bills") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/friends") ||
    pathname.startsWith("/shared") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/feedback");

  if (!sessionCookie && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bills/:path*",
    "/profile/:path*",
    "/friends/:path*",
    "/shared/:path*",
    "/welcome/:path*",
    "/feedback/:path*",
  ],
};
