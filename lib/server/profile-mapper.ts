import { profiles, users } from "../db/schema.ts";
import { ageFromDob } from "../safety.ts";
import type { MemberProfile } from "../types.ts";

export type UserRow = typeof users.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type ProfileValues = typeof profiles.$inferInsert;

function parseList(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function rowToMember(row: ProfileRow, email: string): MemberProfile {
  return {
    firstName: row.firstName,
    email,
    dateOfBirth: row.dateOfBirth,
    age: ageFromDob(row.dateOfBirth) ?? 0,
    gender: row.gender as MemberProfile["gender"],
    city: row.city,
    country: row.country,
    occupation: row.occupation,
    education: row.education,
    languages: parseList(row.languages),
    maritalStatus: row.maritalStatus,
    kids: row.kids,
    relocate: row.relocate,
    alcohol: row.alcohol,
    smoking: row.smoking,
    careerAmbition: row.careerAmbition,
    familyInvolvement: row.familyInvolvement,
    bio: row.bio,
    verse: row.verse,
    intent: row.intent,
    denomination: row.denomination,
    churchName: row.churchName,
    churchCity: row.churchCity,
    attendance: row.attendance,
    bornAgain: row.bornAgain,
    practices: parseList(row.practices),
    courtshipViews: row.courtshipViews,
    denominationImportance: row.denominationImportance as MemberProfile["denominationImportance"],
    hideChurch: row.hideChurch,
    hideCity: row.hideCity,
    hideEmployer: row.hideEmployer,
    photo: row.photo,
  };
}

export function memberToProfileValues(
  member: MemberProfile,
  userId: string,
  now: number
): ProfileValues {
  return {
    userId,
    firstName: member.firstName,
    dateOfBirth: member.dateOfBirth,
    gender: member.gender,
    city: member.city,
    country: "Nigeria",
    occupation: member.occupation,
    education: member.education,
    languages: JSON.stringify(member.languages),
    maritalStatus: member.maritalStatus,
    kids: member.kids,
    relocate: member.relocate,
    alcohol: member.alcohol,
    smoking: member.smoking,
    careerAmbition: member.careerAmbition,
    familyInvolvement: member.familyInvolvement,
    bio: member.bio,
    verse: member.verse,
    intent: member.intent,
    denomination: member.denomination,
    churchName: member.churchName,
    churchCity: member.churchCity,
    attendance: member.attendance,
    bornAgain: member.bornAgain,
    practices: JSON.stringify(member.practices),
    courtshipViews: member.courtshipViews,
    denominationImportance: member.denominationImportance,
    hideChurch: member.hideChurch,
    hideCity: member.hideCity,
    hideEmployer: member.hideEmployer,
    photo: member.photo,
    createdAt: now,
    updatedAt: now,
  };
}
