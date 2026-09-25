import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Next 16 middleware (proxy). Keeps the x-pathname header that
 * app/layout.tsx reads, and gates /admin routes on the JWT session cookie.
 */

const ADMIN_COOKIE = "admin_session";

async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  // Set x-pathname header so app/layout.tsx can read the current path
  response.headers.set("x-pathname", request.nextUrl.pathname);

  const pathname = request.nextUrl.pathname;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdmin = await isAdminRequest(request);

  if (isAdminRoute && !isAdminLogin && !isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminLogin && isAdmin) {
    return NextResponse.redirect(new URL("/admin/markets", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
