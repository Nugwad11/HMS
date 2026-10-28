import { CITIES } from "../data.ts";
import { ageFromDob, isValidDob, isValidEmail, normalizeDob } from "../safety.ts";
import type { DenominationImportance, Gender, MemberProfile } from "../types.ts";
import type { LoginPayload, SignupPayload } from "../auth-types.ts";
import { ApiError } from "./errors.ts";

const GENDERS: Gender[] = ["Female", "Male"];
const IMPORTANCE: DenominationImportance[] = ["Flexible", "Prefer same", "Required"];
const CITY_SET = new Set<string>(CITIES);
const PHOTO_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const PHONE_RE = /^(\+?234|0)[789][01]\d{8}$/;
const MAX_PHOTO_CHARS = 800_000;

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, `${label} is missing or invalid.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, max: number, required = false): string {
  if (value === undefined || value === null) {
    if (required) throw new ApiError(400, `${label} is required.`);
    return "";
  }
  if (typeof value !== "string") throw new ApiError(400, `${label} must be text.`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new ApiError(400, `${label} is required.`);
  if (trimmed.length > max) throw new ApiError(400, `${label} is too long.`);
  return trimmed;
}

function flag(value: unknown): boolean {
  return value === true;
}

function list(value: unknown, label: string, maxItems: number, maxLength: number): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ApiError(400, `${label} must be a list.`);
  return value.slice(0, 30).map((entry) => {
    if (typeof entry !== "string" || entry.trim().length > maxLength) {
      throw new ApiError(400, `${label} contains an invalid value.`);
    }
    return entry.trim();
  }).filter(Boolean).slice(0, maxItems);
}

function photo(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > MAX_PHOTO_CHARS || !PHOTO_RE.test(value)) {
    throw new ApiError(400, "Upload a JPG, PNG or WebP profile photo under 800KB.");
  }
  return value;
}

export function normalizeEmail(value: unknown): string {
  const email = text(value, "Email address", 254, true).toLowerCase();
  if (!isValidEmail(email)) throw new ApiError(400, "Enter a valid email address.");
  return email;
}

export function parseProfile(input: unknown, email: string): MemberProfile {
  const body = asRecord(input, "Profile");
  const firstName = text(body.firstName, "First name", 60, true);

  const rawDob = text(body.dateOfBirth, "Date of birth", 10, true);
  const dateOfBirth = normalizeDob(rawDob);
  if (!dateOfBirth || !isValidDob(dateOfBirth)) {
    throw new ApiError(400, "Enter a valid date of birth. Covenant is for adults 18 and older.");
  }
  const age = ageFromDob(dateOfBirth);
  if (age === null) throw new ApiError(400, "Enter a valid date of birth.");

  if (typeof body.gender !== "string" || !GENDERS.includes(body.gender as Gender)) {
    throw new ApiError(400, "Choose Female or Male.");
  }
  const gender = body.gender as Gender;

  const city = text(body.city, "City or state", 80, true);
  if (!CITY_SET.has(city)) {
    throw new ApiError(400, "Choose a Nigerian city or state from the list.");
  }

  const importance = IMPORTANCE.includes(body.denominationImportance as DenominationImportance)
    ? (body.denominationImportance as DenominationImportance)
    : "Prefer same";

  return {
    firstName,
    email,
    dateOfBirth,
    age,
    gender,
    city,
    country: "Nigeria",
    occupation: text(body.occupation, "Occupation", 120),
    education: text(body.education, "Education", 120),
    languages: list(body.languages, "Languages", 20, 40),
    maritalStatus: text(body.maritalStatus, "Relationship status", 60),
    kids: text(body.kids, "Children", 60),
    relocate: text(body.relocate, "Relocation preference", 80),
    alcohol: text(body.alcohol, "Alcohol preference", 60),
    smoking: text(body.smoking, "Smoking preference", 60),
    careerAmbition: text(body.careerAmbition, "Career ambition", 200),
    familyInvolvement: text(body.familyInvolvement, "Family involvement", 80),
    bio: text(body.bio, "Bio", 1500),
    verse: text(body.verse, "Favourite verse", 200),
    intent: text(body.intent, "Relationship goal", 80),
    denomination: text(body.denomination, "Denomination", 80),
    churchName: text(body.churchName, "Church name", 120),
    churchCity: text(body.churchCity, "Church city", 80),
    attendance: text(body.attendance, "Church attendance", 60),
    bornAgain: text(body.bornAgain, "Born again / baptism", 80),
    practices: list(body.practices, "Spiritual practices", 20, 60),
    courtshipViews: text(body.courtshipViews, "Courtship views", 140),
    denominationImportance: importance,
    hideChurch: flag(body.hideChurch),
    hideCity: flag(body.hideCity),
    hideEmployer: flag(body.hideEmployer),
    photo: photo(body.photo),
  };
}

export function parseSignupPayload(input: unknown): SignupPayload {
  const body = asRecord(input, "Sign-up details");
  const email = normalizeEmail(body.email);

  if (typeof body.password !== "string") throw new ApiError(400, "Choose a password.");
  const password = body.password;
  if (password.length < 10) {
    throw new ApiError(400, "Use a password of at least 10 characters.");
  }
  if (password.length > 200) {
    throw new ApiError(400, "That password is too long.");
  }

  const phoneRaw = text(body.phone, "Phone number", 32);
  const phoneDigits = phoneRaw ? phoneRaw.replace(/\D/g, "") : "";
  if (phoneDigits && !PHONE_RE.test(phoneDigits)) {
    throw new ApiError(400, "Enter a valid Nigerian mobile number, for example 0803 123 4567.");
  }

  const profile = parseProfile(body.profile, email);
  return { email, password, phone: phoneDigits || null, profile };
}

export function parseLoginPayload(input: unknown): LoginPayload {
  const body = asRecord(input, "Sign-in details");
  const email = normalizeEmail(body.email);
  if (typeof body.password !== "string" || !body.password || body.password.length > 200) {
    throw new ApiError(400, "Enter your password.");
  }
  return { email, password: body.password };
}

export function parseEmailCode(input: unknown): string {
  const body = asRecord(input, "Verification code");
  if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code.trim())) {
    throw new ApiError(400, "Enter the 6-digit code from your email.");
  }
  return body.code.trim();
}

export function parsePasswordConfirmation(input: unknown): string {
  const body = asRecord(input, "Confirmation");
  if (typeof body.password !== "string" || !body.password) {
    throw new ApiError(400, "Enter your password to confirm.");
  }
  return body.password;
}
