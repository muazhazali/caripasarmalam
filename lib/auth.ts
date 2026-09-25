import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

/**
 * Admin auth: single-admin password + HS256 JWT session cookie.
 * Replaces Supabase Auth. Secrets come from wrangler secrets / .env:
 *   ADMIN_PASSWORD - admin login password
 *   JWT_SECRET     - JWT signing secret
 */

export const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface AdminUser {
  id: string;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function login(password: string): Promise<{ error?: string }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "Server not configured for admin login." };

  // Constant-time comparison of SHA-256 digests (fixed length, hex chars)
  const [a, b] = await Promise.all([digest(password), digest(expected)]);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  if (mismatch !== 0) return { error: "Invalid credentials." };

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return {};
}

async function digest(value: string): Promise<string> {
  const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(data))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Get the current admin user identity (constant, single-admin setup).
 * Returns null when not authenticated.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!(await isAuthenticated())) return null;
  return { id: "admin", email: process.env.ADMIN_EMAIL ?? "admin" };
}

/**
 * Require an authenticated admin. Redirects to /admin/login otherwise.
 */
export async function requireAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}