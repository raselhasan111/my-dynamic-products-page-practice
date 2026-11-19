import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { getAdminCode } from "@/config/admin";

const COOKIE = "admin_session";
const SESSION_SECONDS = 12 * 60 * 60;
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const sha = (s: string) => createHash("sha256").update(s).digest();
const sign = (exp: string) => createHmac("sha256", `admin-session:${getAdminCode()}`).update(exp).digest("hex");

export function codeMatches(input: string): boolean {
  return timingSafeEqual(sha(input), sha(getAdminCode()));
}

// ---- wrong-code limiter (in memory: best effort, resets when the server restarts) ----
const fails = new Map<string, { count: number; resetAt: number }>();

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function isBlocked(): Promise<boolean> {
  const f = fails.get(await clientIp());
  return !!f && f.resetAt > Date.now() && f.count >= MAX_FAILS;
}

export async function recordFail() {
  const ip = await clientIp();
  const now = Date.now();
  for (const [k, v] of fails) if (v.resetAt <= now) fails.delete(k);
  const f = fails.get(ip);
  fails.set(ip, f && f.resetAt > now ? { ...f, count: f.count + 1 } : { count: 1, resetAt: now + WINDOW_MS });
}

export async function clearFails() {
  fails.delete(await clientIp());
}

// ---- session cookie: "<expiry>.<hmac>"; changing ADMIN_CODE invalidates every session ----
export async function createSession() {
  const exp = String(Date.now() + SESSION_SECONDS * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSession() {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0 });
}

export async function isAdmin(): Promise<boolean> {
  try {
    await connection(); // compares against Date.now(), so wait for a real request (not a prerender)
    const value = (await cookies()).get(COOKIE)?.value;
    if (!value) return false;
    const [exp, mac] = value.split(".");
    if (!exp || !mac || Number(exp) <= Date.now()) return false;
    const want = Buffer.from(sign(exp));
    const got = Buffer.from(mac);
    return want.length === got.length && timingSafeEqual(want, got);
  } catch {
    return false; // e.g. ADMIN_CODE not configured
  }
}

// Call at the start of EVERY server action: a page-level check does not protect actions.
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
