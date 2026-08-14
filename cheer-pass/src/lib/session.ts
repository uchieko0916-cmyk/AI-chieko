import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30日

export type SessionPayload = { userId: string; role: "parent" | "admin" };

function sign(data: string) {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createSessionToken(payload: SessionPayload): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    if (parsed.role !== "parent" && parsed.role !== "admin") return null;
    return { userId: parsed.userId, role: parsed.role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "cp_session";
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
