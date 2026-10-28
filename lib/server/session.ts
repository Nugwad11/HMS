import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import type { SessionUser } from "@/lib/auth-types";
import { createSession, deleteSessionByToken, findUserBySessionToken, toSessionUser } from "./accounts";
import { ApiError } from "./errors";

export const SESSION_COOKIE = "covenant_session";

export async function startSession(userId: string): Promise<void> {
  const { token, expiresAt } = createSession(getDb(), userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) deleteSessionByToken(getDb(), token);
  store.delete(SESSION_COOKIE);
}

export async function readSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = findUserBySessionToken(getDb(), token);
  return user ? toSessionUser(user) : null;
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await readSessionUser();
  if (!user) throw new ApiError(401, "Sign in to continue.", "unauthenticated");
  return user;
}
