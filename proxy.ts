import { NextRequest, NextResponse } from "next/server";

const PUBLIC_AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = [...PUBLIC_AUTH_ROUTES, "/payment"];

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

const isAuthRoute = (pathname: string) => {
  return PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;
  const isLoggedIn = Boolean(token);
  const requestHeaders = new Headers(request.headers);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    return;
  }

  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (pathname === "/") {
    const target = isLoggedIn ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (!isLoggedIn && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
