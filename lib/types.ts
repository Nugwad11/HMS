export type VerificationLevel = 0 | 1 | 2 | 3;

export type Gender = "Female" | "Male";

export type DenominationImportance = "Flexible" | "Prefer same" | "Required";

export const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  0: "Unverified",
  1: "Phone verified",
  2: "Photo verified",
  3: "ID verified",
};

export const VERIFICATION_STEPS: Array<{
  level: VerificationLevel;
  name: string;
  unlocks: string;
}> = [
  { level: 1, name: "Phone", unlocks: "Create a profile and browse limited members" },
  { level: 2, name: "Photo", unlocks: "Send and receive messages, post in rooms" },
  { level: 3, name: "ID", unlocks: "Get the “Verified” badge and priority visibility" },
];

export interface MemberProfile {
  firstName: string;
  email: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  city: string;
  country: string;
  occupation: string;
  education: string;
  languages: string[];
  maritalStatus: string;
  kids: string;
  relocate: string;
  alcohol: string;
  smoking: string;
  careerAmbition: string;
  familyInvolvement: string;
  bio: string;
  verse: string;
  intent: string;
  denomination: string;
  churchName: string;
  churchCity: string;
  attendance: string;
  bornAgain: string;
  practices: string[];
  courtshipViews: string;
  denominationImportance: DenominationImportance;
  hideChurch: boolean;
  hideCity: boolean;
  hideEmployer: boolean;
  photo: string | null;
}

export interface Profile {
  id: string;
  firstName: string;
  age: number;
  gender: Gender;
  city: string;
  denomination: string;
  attendance: string;
  job: string;
  bio: string;
  verse: string;
  verified: VerificationLevel;
  intent: string;
  kids: string;
  languages: string[];
  likesYou: boolean;
}

export interface Preferences {
  ageMin: number;
  ageMax: number;
  cities: string[];
  attendance: string[];
  minVerification: VerificationLevel;
  denominationImportance: DenominationImportance;
}

export interface NotificationSettings {
  matches: boolean;
  messages: boolean;
  dailyMatches: boolean;
  productUpdates: boolean;
}

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  at: number;
  flagged?: boolean;
  flagNotes?: string[];
  author?: string;
}

export type SafetyFlagKind = "financial" | "off-platform" | "profile-mismatch" | "dob-mismatch";

export const SAFETY_FLAG_LABELS: Record<SafetyFlagKind, string> = {
  financial: "Financial request",
  "off-platform": "Off-platform contact",
  "profile-mismatch": "Profile detail mismatch",
  "dob-mismatch": "Date of birth mismatch",
};

export type SafetyFlagStatus = "open" | "upheld" | "cleared";

export interface SafetyFlag {
  id: string;
  kind: SafetyFlagKind;
  subjectId: string;
  subjectName: string;
  summary: string;
  evidence: string;
  severity: "High" | "Standard";
  status: SafetyFlagStatus;
  at: number;
  emailTo: string | null;
  emailSentAt: number | null;
}

export interface DemoEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  at: number;
  category: "verification" | "safety" | "system";
}

export interface IdCheck {
  at: number;
  profileDob: string;
  matched: boolean;
}

export interface Report {
  id: string;
  profileId: string;
  profileName: string;
  reason: string;
  severity: "High" | "Standard";
  at: number;
}

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
  topic: string;
}
