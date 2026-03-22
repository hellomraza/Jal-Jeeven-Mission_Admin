import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for protecting authenticated routes
 *
 * SECURITY:
 * - Checks HTTP-only cookie (access_token) on the server
 * - Protects routes from unauthenticated access
 * - Runs BEFORE rendering, preventing hydration issues
 * - Works regardless of JavaScript being disabled
 *
 * Protected routes: /dashboard, /work-order, /reports, /status, etc.
 * Public routes: /, /login, /agreement
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/login", "/agreement", "/debug"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get the access_token cookie (set by backend during login)
  const accessToken = request.cookies.get("access_token")?.value;
  console.log(
    "Middleware check - Path:",
    pathname,
    "Access Token:",
    !!accessToken,
  );

  // If trying to access protected route without token, redirect to login
  if (!isPublicRoute && !accessToken) {
    return NextResponse.redirect(
      new URL("/login?redirect=" + encodeURIComponent(pathname), request.url),
    );
  }

  // If user HAS token and is on public route, redirect to dashboard
  if ((pathname === "/login" || pathname === "/") && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/* (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
