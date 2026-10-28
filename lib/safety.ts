import { CITIES, DENOMINATIONS } from "./data.ts";
import type { SafetyFlagKind } from "./types.ts";

export type ChatFlagKind = Exclude<SafetyFlagKind, "dob-mismatch">;

export interface ScanContext {
  age: number;
  city: string;
  denomination: string;
}

export interface SafetyFinding {
  kind: ChatFlagKind;
  severity: "High" | "Standard";
  summary: string;
  evidence: string;
}

const MONEY_TERM =
  /\b(money|naira|cash|airtime|data bundle|gift ?cards?|bitcoin|crypto(?:currency)?|usdt|western union|bank transfer|account number|allowance|school fees|transport fare|rent|financial (?:help|support)|funds?)\b/i;
const MONEY_REQUEST =
  /\b(send|transfer|give|help|lend|borrow|dash|pay|support|sponsor|credit|deposit)\b/i;
const CURRENCY_AMOUNT = /(?:₦|N\s?\d{2,}|\b\d{2,}k\b|\bnaira\b)/i;
const ACCOUNT_DETAILS = /\b(?:account|acct)\s*(?:number|no\.?)?\s*(?:is\s*)?[:.-]?\s*\d{8,}\b/i;
const OFF_PLATFORM =
  /\b(whatsapp|telegram|snapchat|instagram|insta|facebook|tiktok|signal|imo|wechat|wa\.me|t\.me)\b/i;
const CONTACT_SHARE =
  /\b(call me|text me|my number|phone number|email me|my email|off this (?:app|platform)|outside this (?:app|platform)|move (?:this|our) (?:chat|conversation)|chat (?:on|via) (?:whatsapp|telegram))\b/i;
const LINK = /https?:\/\/|www\./i;
const NIGERIAN_PHONE = /\b(?:\+?234|0)[789][01]\d{8}\b/;

const AGE_PATTERNS = [
  /(?:i(?:'m| am)|my age is)\s+(\d{1,2})\b/i,
  /\b(\d{1,2})\s*(?:years?|yrs?)\s*old\b/i,
];
const CITY_CLAIM =
  /(?:i live in|i(?:'m| am) based in|i stay in|i reside in|i(?:'m| am) in)\s+([a-z][a-z\s]{2,24})/i;
const DENOMINATION_CLAIM =
  /(?:i(?:'m| am)|i attend(?: a| an)?)\s+(?:a\s+|an\s+)?(pentecostal|catholic|anglican|baptist|methodist|presbyterian|evangelical|apostolic|adventist)\b/i;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function evidence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}…` : trimmed;
}

export function scanMessage(text: string, context: ScanContext): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  const seen = new Set<ChatFlagKind>();
  const push = (finding: SafetyFinding) => {
    if (seen.has(finding.kind)) return;
    seen.add(finding.kind);
    findings.push(finding);
  };

  const asksForMoney =
    (MONEY_TERM.test(text) && MONEY_REQUEST.test(text)) ||
    CURRENCY_AMOUNT.test(text) ||
    ACCOUNT_DETAILS.test(text) ||
    /\b(gift ?cards?|bitcoin|crypto|western union)\b/i.test(text);

  if (asksForMoney) {
    push({
      kind: "financial",
      severity: "High",
      summary: "Asks for money or financial help",
      evidence: evidence(text),
    });
  }

  if (
    OFF_PLATFORM.test(text) ||
    CONTACT_SHARE.test(text) ||
    LINK.test(text) ||
    NIGERIAN_PHONE.test(text)
  ) {
    push({
      kind: "off-platform",
      severity: "Standard",
      summary: "Asks to move the conversation off Covenant",
      evidence: evidence(text),
    });
  }

  for (const pattern of AGE_PATTERNS) {
    const match = pattern.exec(text);
    if (!match) continue;
    const claimed = Number(match[1]);
    if (claimed >= 18 && claimed <= 99 && claimed !== context.age) {
      push({
        kind: "profile-mismatch",
        severity: "Standard",
        summary: `Claims to be ${claimed}, but the profile says ${context.age}`,
        evidence: evidence(text),
      });
    }
    break;
  }

  const cityMatch = CITY_CLAIM.exec(text);
  if (cityMatch) {
    const claimedCity = CITIES.find((city) =>
      new RegExp(`\\b${escapeRegExp(city)}\\b`, "i").test(cityMatch[1])
    );
    if (claimedCity && claimedCity.toLowerCase() !== context.city.toLowerCase()) {
      push({
        kind: "profile-mismatch",
        severity: "Standard",
        summary: `Says they live in ${claimedCity}, but the profile says ${context.city}`,
        evidence: evidence(text),
      });
    }
  }

  const denominationMatch = DENOMINATION_CLAIM.exec(text);
  if (denominationMatch) {
    const claimed = DENOMINATIONS.find(
      (denomination) => denomination.toLowerCase() === denominationMatch[1].toLowerCase()
    );
    if (claimed && claimed.toLowerCase() !== context.denomination.toLowerCase()) {
      push({
        kind: "profile-mismatch",
        severity: "Standard",
        summary: `Says they are ${claimed}, but the profile says ${context.denomination}`,
        evidence: evidence(text),
      });
    }
  }

  return findings;
}

export function normalizeDob(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

export function dobMatches(profileDob: string, idDob: string): boolean {
  const profile = normalizeDob(profileDob);
  const identity = normalizeDob(idDob);
  return Boolean(profile && identity && profile === identity);
}

export function ageFromDob(dob: string, now = new Date()): number | null {
  const normalised = normalizeDob(dob);
  if (!normalised) return null;
  const [year, month, day] = normalised.split("-").map(Number);
  let age = now.getFullYear() - year;
  const hasHadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hasHadBirthday) age -= 1;
  return age >= 0 && age <= 120 ? age : null;
}

export function isValidDob(dob: string, now = new Date()): boolean {
  const age = ageFromDob(dob, now);
  return age !== null && age >= 18 && age <= 100;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDob(dob: string): string {
  const normalised = normalizeDob(dob);
  if (!normalised) return "not set";
  const [year, month, day] = normalised.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(trimmed);
}

export function isEmailVerified(email: string | null | undefined, verifiedEmail: string | null): boolean {
  if (!email || !verifiedEmail) return false;
  return email.trim().toLowerCase() === verifiedEmail.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at < 1) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  return `${local.slice(0, 1)}${"*".repeat(Math.max(1, local.length - 1))}${domain}`;
}
