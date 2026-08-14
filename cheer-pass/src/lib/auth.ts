import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "./session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/**
 * AuthProvider抽象化
 * 現在はメール+パスワードの CredentialsAuthProvider のみ実装。
 * 将来 LINE Login を追加する際は、この形の provider を追加すれば
 * login() の呼び出し元（Server Action）は変更せずに済む想定。
 */
export interface AuthProvider {
  login(input: {
    email: string;
    password: string;
  }): Promise<{ id: string; role: "parent" | "admin" } | null>;
}

export const credentialsAuthProvider: AuthProvider = {
  async login({ email, password }) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, role: user.role };
  },
};

export async function createSession(userId: string, role: "parent" | "admin") {
  const token = createSessionToken({ userId, role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.userId } });
}

export async function requireParent() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }
  return user;
}
