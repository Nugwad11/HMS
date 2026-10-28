import { and, desc, eq, gt, isNull, lt } from "drizzle-orm";
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { emailCodes, profiles, sessions, users } from "../db/schema.ts";
import type { AppDatabase } from "../db/index.ts";
import type { SessionUser, SignupPayload } from "../auth-types.ts";
import type { MemberProfile } from "../types.ts";
import { ApiError } from "./errors.ts";
import { hashSecret, verifySecret } from "./password.ts";
import { memberToProfileValues, rowToMember, type UserRow } from "./profile-mapper.ts";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_WINDOW_MS = 15 * 60 * 1000;
const MAX_CODES_PER_WINDOW = 5;
const MAX_CODE_ATTEMPTS = 5;

export function toSessionUser(row: UserRow): SessionUser {
  return { id: row.id, email: row.email, emailVerified: row.emailVerifiedAt !== null };
}

export function getUserById(db: AppDatabase, userId: string): UserRow | null {
  return db.select().from(users).where(eq(users.id, userId)).get() ?? null;
}

export function getProfile(db: AppDatabase, userId: string): MemberProfile | null {
  const user = getUserById(db, userId);
  if (!user) return null;
  const row = db.select().from(profiles).where(eq(profiles.userId, userId)).get();
  return row ? rowToMember(row, user.email) : null;
}

export async function registerAccount(
  db: AppDatabase,
  payload: SignupPayload
): Promise<{ user: SessionUser; profile: MemberProfile }> {
  const existing = db.select({ id: users.id }).from(users).where(eq(users.email, payload.email)).get();
  if (existing) {
    throw new ApiError(409, "An account with that email already exists. Sign in instead.", "email-taken");
  }

  const passwordHash = await hashSecret(payload.password);
  const id = randomUUID();
  const now = Date.now();

  try {
    db.transaction((tx) => {
      tx.insert(users)
        .values({
          id,
          email: payload.email,
          passwordHash,
          phone: payload.phone,
          emailVerifiedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      tx.insert(profiles).values(memberToProfileValues(payload.profile, id, now)).run();
    });
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed: users\.email/i.test(error.message)) {
      throw new ApiError(409, "An account with that email already exists. Sign in instead.", "email-taken");
    }
    throw error;
  }

  return {
    user: { id, email: payload.email, emailVerified: false },
    profile: payload.profile,
  };
}

export async function authenticateAccount(
  db: AppDatabase,
  email: string,
  password: string
): Promise<UserRow | null> {
  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    // Spend comparable work so a missing account is not obvious from timing.
    await hashSecret(password);
    return null;
  }
  return (await verifySecret(password, user.passwordHash)) ? user : null;
}

export function saveProfileForUser(
  db: AppDatabase,
  userId: string,
  member: MemberProfile
): MemberProfile {
  const existing = db.select().from(profiles).where(eq(profiles.userId, userId)).get();
  if (!existing) throw new ApiError(404, "Profile not found.", "profile-missing");

  const now = Date.now();
  db.transaction((tx) => {
    tx.update(profiles)
      .set({ ...memberToProfileValues(member, userId, now), createdAt: existing.createdAt, updatedAt: now })
      .where(eq(profiles.userId, userId))
      .run();
    tx.update(users).set({ updatedAt: now }).where(eq(users.id, userId)).run();
  });

  return member;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession(
  db: AppDatabase,
  userId: string,
  now = Date.now()
): { token: string; expiresAt: number } {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = now + SESSION_MS;

  db.delete(sessions).where(lt(sessions.expiresAt, now)).run();
  db.insert(sessions)
    .values({ id: hashToken(token), userId, createdAt: now, expiresAt })
    .run();

  return { token, expiresAt };
}

export function findUserBySessionToken(
  db: AppDatabase,
  token: string,
  now = Date.now()
): UserRow | null {
  const session = db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, now)))
    .get();
  if (!session) return null;
  return getUserById(db, session.userId);
}

export function deleteSessionByToken(db: AppDatabase, token: string): void {
  db.delete(sessions).where(eq(sessions.id, hashToken(token))).run();
}

export async function issueEmailCode(
  db: AppDatabase,
  userId: string,
  now = Date.now()
): Promise<{ code: string; expiresAt: number }> {
  const recent = db
    .select({ id: emailCodes.id })
    .from(emailCodes)
    .where(and(eq(emailCodes.userId, userId), gt(emailCodes.createdAt, now - CODE_WINDOW_MS)))
    .all();
  if (recent.length >= MAX_CODES_PER_WINDOW) {
    throw new ApiError(429, "Too many codes requested. Wait a few minutes and try again.", "code-rate-limited");
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = await hashSecret(code);
  const expiresAt = now + CODE_TTL_MS;

  db.transaction((tx) => {
    tx.delete(emailCodes)
      .where(and(eq(emailCodes.userId, userId), lt(emailCodes.createdAt, now - 24 * 60 * 60 * 1000)))
      .run();
    // Superseded codes stay on record so the request window can be counted.
    tx.update(emailCodes)
      .set({ consumedAt: now })
      .where(and(eq(emailCodes.userId, userId), isNull(emailCodes.consumedAt)))
      .run();
    tx.insert(emailCodes)
      .values({ id: randomUUID(), userId, codeHash, attempts: 0, expiresAt, consumedAt: null, createdAt: now })
      .run();
  });

  return { code, expiresAt };
}

export type EmailCodeResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "invalid" | "locked" };

export async function verifyEmailCode(
  db: AppDatabase,
  userId: string,
  code: string,
  now = Date.now()
): Promise<EmailCodeResult> {
  const record = db
    .select()
    .from(emailCodes)
    .where(and(eq(emailCodes.userId, userId), isNull(emailCodes.consumedAt)))
    .orderBy(desc(emailCodes.createdAt))
    .get();

  if (!record) return { ok: false, reason: "missing" };
  if (record.expiresAt < now) return { ok: false, reason: "expired" };
  if (record.attempts >= MAX_CODE_ATTEMPTS) return { ok: false, reason: "locked" };

  if (!(await verifySecret(code, record.codeHash))) {
    const attempts = record.attempts + 1;
    db.update(emailCodes).set({ attempts }).where(eq(emailCodes.id, record.id)).run();
    return { ok: false, reason: attempts >= MAX_CODE_ATTEMPTS ? "locked" : "invalid" };
  }

  db.transaction((tx) => {
    tx.update(emailCodes).set({ consumedAt: now }).where(eq(emailCodes.id, record.id)).run();
    tx.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, userId)).run();
  });

  return { ok: true };
}

export async function deleteAccount(
  db: AppDatabase,
  userId: string,
  password: string
): Promise<void> {
  const user = getUserById(db, userId);
  if (!user) throw new ApiError(404, "Account not found.", "account-missing");
  if (!(await verifySecret(password, user.passwordHash))) {
    throw new ApiError(401, "That password is not correct.", "bad-password");
  }
  db.delete(users).where(eq(users.id, userId)).run();
}
