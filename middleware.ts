import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  // Set x-pathname header so app/layout.tsx can read the current path
  response.headers.set("x-pathname", request.nextUrl.pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = !!user && (!adminEmail || user.email === adminEmail);

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
