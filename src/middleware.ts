import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "bluehub_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const secret = process.env.ADMIN_SECRET ?? "bluehub-dev-secret";
  const isAuthed = token === secret;

  if (isLoginPage && isAuthed) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoginPage && !isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
