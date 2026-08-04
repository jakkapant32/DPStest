import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bluehub_admin";

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? "bluehub-dev-secret";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "bluehub2026";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return token === getAdminSecret();
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
