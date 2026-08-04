import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminPassword,
  getAdminSecret,
  isAdminAuthenticated,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body as { password?: string };

  if (password !== getAdminPassword()) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, getAdminSecret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
