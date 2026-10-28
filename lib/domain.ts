import type { MemberProfile, Preferences, Profile, VerificationLevel } from "./types";

export function remainingDailyInterests(used: number, premium: boolean): number {
  if (!premium) return 0;
  return Math.max(0, 20 - Math.max(0, used));
}

export function countDailyInterests(sentAt: number[], now = new Date()): number {
  const today = now.toDateString();
  return sentAt.filter((timestamp) => new Date(timestamp).toDateString() === today).length;
}

export function canMessage({
  isMatch,
  verification,
  emailVerified,
  premium,
}: {
  isMatch: boolean;
  verification: VerificationLevel;
  emailVerified: boolean;
  premium: boolean;
}): boolean {
  return premium && isMatch && verification >= 2 && emailVerified;
}

export function toggleSaved(saved: string[], profileId: string): string[] {
  return saved.includes(profileId)
    ? saved.filter((id) => id !== profileId)
    : [...saved, profileId];
}

export function scoreProfile(
  profile: Profile,
  member: MemberProfile,
  preferences: Preferences
): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  if (profile.denomination === member.denomination) {
    score += 20;
    reasons.push("Same denomination");
  }
  if (profile.attendance === member.attendance) {
    score += 10;
    reasons.push("Similar church attendance");
  }
  if (profile.city === member.city) {
    score += 12;
    reasons.push("Same city");
  }
  if (profile.intent === member.intent) {
    score += 8;
    reasons.push("Similar relationship goals");
  }
  const sharedLanguage = profile.languages.find((language) => member.languages.includes(language));
  if (sharedLanguage) {
    score += 5;
    reasons.push(`Shares ${sharedLanguage}`);
  }
  if (profile.verified >= 2) {
    score += 5;
    reasons.push("Photo verified");
  }
  if (profile.verified >= 3) {
    score += 3;
    reasons.push("ID verified");
  }
  if (profile.age >= preferences.ageMin && profile.age <= preferences.ageMax) {
    score += 6;
    reasons.push("Within your age range");
  }

  return {
    score: Math.min(98, score),
    reasons: reasons.length > 0 ? reasons : ["Shared intent for Christian courtship"],
  };
}

export function passesPreferences(
  profile: Profile,
  member: MemberProfile,
  preferences: Preferences
): boolean {
  if (profile.age < preferences.ageMin || profile.age > preferences.ageMax) return false;
  if (preferences.cities.length > 0 && !preferences.cities.includes(profile.city)) return false;
  if (preferences.attendance.length > 0 && !preferences.attendance.includes(profile.attendance)) return false;
  if (profile.verified < preferences.minVerification) return false;
  if (preferences.denominationImportance === "Required" && profile.denomination !== member.denomination) {
    return false;
  }
  return true;
}

export function isEligibleProfile(
  profile: Profile,
  member: MemberProfile,
  preferences: Preferences
): boolean {
  if (profile.gender === member.gender) return false;
  return passesPreferences(profile, member, preferences);
}
