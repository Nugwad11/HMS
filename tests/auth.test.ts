import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase, runMigrations, type AppDatabase } from "../lib/db/index.ts";
import { hashSecret, verifySecret } from "../lib/server/password.ts";
import {
  authenticateAccount,
  createSession,
  deleteAccount,
  deleteSessionByToken,
  findUserBySessionToken,
  getProfile,
  getUserById,
  issueEmailCode,
  registerAccount,
  saveProfileForUser,
  verifyEmailCode,
} from "../lib/server/accounts.ts";
import { ageFromDob } from "../lib/safety.ts";
import { parseSignupPayload } from "../lib/server/validation.ts";

function freshDb(): AppDatabase {
  const db = createDatabase(":memory:");
  runMigrations(db);
  return db;
}

const baseProfile = {
  firstName: "Ada",
  dateOfBirth: "1994-05-12",
  gender: "Female",
  city: "Lagos",
  languages: ["English", "Igbo"],
};

function signupPayload(email = "ada@example.com", password = "correct horse battery") {
  return parseSignupPayload({ email, password, phone: "08031234567", profile: baseProfile });
}

test("password hashing is salted and verifies", async () => {
  const first = await hashSecret("correct horse battery");
  const second = await hashSecret("correct horse battery");
  assert.notEqual(first, second);
  assert.equal(await verifySecret("correct horse battery", first), true);
  assert.equal(await verifySecret("wrong password", first), false);
  assert.equal(await verifySecret("anything", "not-a-hash"), false);
});

test("signup validates email, password length and date of birth", () => {
  const tooYoung = new Date();
  tooYoung.setFullYear(tooYoung.getFullYear() - 5);
  const tooYoungDob = tooYoung.toISOString().slice(0, 10);

  assert.throws(() => parseSignupPayload({ email: "nope", password: "longenough1", profile: baseProfile }));
  assert.throws(() => parseSignupPayload({ email: "a@b.co", password: "short", profile: baseProfile }));
  assert.throws(() =>
    parseSignupPayload({
      email: "a@b.co",
      password: "longenough1",
      profile: { ...baseProfile, dateOfBirth: tooYoungDob },
    })
  );
});

test("registration creates a profile and rejects duplicate emails", async () => {
  const db = freshDb();
  const payload = signupPayload();
  const { user, profile } = await registerAccount(db, payload);

  assert.equal(user.email, "ada@example.com");
  assert.equal(user.emailVerified, false);
  assert.equal(profile.age, ageFromDob("1994-05-12"));

  const stored = getProfile(db, user.id);
  assert.equal(stored?.firstName, "Ada");
  assert.deepEqual(stored?.languages, ["English", "Igbo"]);

  await assert.rejects(registerAccount(db, payload), (error: unknown) => {
    return (error as { code?: string }).code === "email-taken";
  });
});

test("login accepts the right password only", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());

  assert.equal(await authenticateAccount(db, "ADA@example.com", "correct horse battery"), null);
  assert.equal((await authenticateAccount(db, "ada@example.com", "correct horse battery"))?.id, user.id);
  assert.equal(await authenticateAccount(db, "ada@example.com", "wrong password"), null);
  assert.equal(await authenticateAccount(db, "nobody@example.com", "correct horse battery"), null);
});

test("sessions resolve to their user, expire and can be revoked", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());
  const { token } = createSession(db, user.id);

  assert.equal(findUserBySessionToken(db, token)?.id, user.id);
  assert.equal(findUserBySessionToken(db, "fabricated-token"), null);
  assert.equal(findUserBySessionToken(db, token, Date.now() + 31 * 24 * 60 * 60 * 1000), null);

  deleteSessionByToken(db, token);
  assert.equal(findUserBySessionToken(db, token), null);
});

test("email codes verify once, track attempts and expire", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());

  const { code } = await issueEmailCode(db, user.id);
  assert.match(code, /^\d{6}$/);

  const wrong = code === "000000" ? "111111" : "000000";
  assert.deepEqual(await verifyEmailCode(db, user.id, wrong), { ok: false, reason: "invalid" });
  assert.deepEqual(await verifyEmailCode(db, user.id, code), { ok: true });
  assert.equal(getUserById(db, user.id)?.emailVerifiedAt !== null, true);
  assert.deepEqual(await verifyEmailCode(db, user.id, code), { ok: false, reason: "missing" });
});

test("expired email codes are rejected", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());
  const { code, expiresAt } = await issueEmailCode(db, user.id);

  assert.deepEqual(await verifyEmailCode(db, user.id, code, expiresAt + 1), {
    ok: false,
    reason: "expired",
  });
});

test("code requests are rate limited per account", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());

  for (let index = 0; index < 5; index += 1) {
    await issueEmailCode(db, user.id);
  }
  await assert.rejects(issueEmailCode(db, user.id), (error: unknown) => {
    return (error as { code?: string }).code === "code-rate-limited";
  });
});

test("profile updates persist and recompute age", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());
  const original = getProfile(db, user.id);
  assert.ok(original);

  const updated = saveProfileForUser(db, user.id, {
    ...original,
    firstName: "Adaeze",
    city: "Abuja",
    dateOfBirth: "1990-01-01",
    age: 36,
    bio: "Grace upon grace.",
    hideChurch: true,
  });

  assert.equal(updated.age, ageFromDob("1990-01-01"));

  const reloaded = getProfile(db, user.id);
  assert.equal(reloaded?.firstName, "Adaeze");
  assert.equal(reloaded?.city, "Abuja");
  assert.equal(reloaded?.hideChurch, true);
  assert.equal(reloaded?.age, ageFromDob("1990-01-01"));
  assert.equal(reloaded?.bio, "Grace upon grace.");
});

test("account deletion requires the password and removes the account", async () => {
  const db = freshDb();
  const { user } = await registerAccount(db, signupPayload());

  await assert.rejects(deleteAccount(db, user.id, "not the password"), (error: unknown) => {
    return (error as { code?: string }).code === "bad-password";
  });
  assert.ok(getProfile(db, user.id));

  await deleteAccount(db, user.id, "correct horse battery");
  assert.equal(getUserById(db, user.id), null);
  assert.equal(getProfile(db, user.id), null);
});
