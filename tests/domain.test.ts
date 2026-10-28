import assert from "node:assert/strict";
import test from "node:test";
import {
  canMessage,
  countDailyInterests,
  isEligibleProfile,
  passesPreferences,
  remainingDailyInterests,
  scoreProfile,
  toggleSaved,
} from "../lib/domain.ts";
import {
  CITIES,
  DEFAULT_MEMBER,
  DEFAULT_PREFERENCES,
  LANGUAGES,
  PROFILES,
} from "../lib/data.ts";

test("free members have no daily interest allowance", () => {
  assert.equal(remainingDailyInterests(0, false), 0);
});

test("premium members have twenty interests remaining before they send any", () => {
  assert.equal(remainingDailyInterests(0, true), 20);
});

test("daily interests never show a negative remainder", () => {
  assert.equal(remainingDailyInterests(25, true), 0);
});

test("messaging requires Premium, a mutual match, photo verification and a verified email", () => {
  assert.equal(canMessage({ isMatch: true, verification: 3, emailVerified: true, premium: false }), false);
  assert.equal(canMessage({ isMatch: false, verification: 3, emailVerified: true, premium: true }), false);
  assert.equal(canMessage({ isMatch: true, verification: 1, emailVerified: true, premium: true }), false);
  assert.equal(canMessage({ isMatch: true, verification: 2, emailVerified: false, premium: true }), false);
  assert.equal(canMessage({ isMatch: true, verification: 2, emailVerified: true, premium: true }), true);
  assert.equal(canMessage({ isMatch: true, verification: 3, emailVerified: true, premium: true }), true);
});

test("daily interest count includes only timestamps on the current local day", () => {
  const now = new Date(2026, 9, 27, 12, 0, 0);
  const sameDay = new Date(2026, 9, 27, 8, 0, 0).getTime();
  const priorDay = new Date(2026, 9, 26, 23, 59, 59).getTime();
  assert.equal(countDailyInterests([sameDay, priorDay], now), 1);
});

test("saved profiles can be toggled on and off without duplicating ids", () => {
  assert.deepEqual(toggleSaved([], "p1"), ["p1"]);
  assert.deepEqual(toggleSaved(["p1"], "p1"), []);
  assert.deepEqual(toggleSaved(["p1", "p2"], "p1"), ["p2"]);
});

test("compatibility scoring rewards shared church, city and intent", () => {
  const adaeze = PROFILES.find((profile) => profile.id === "p1");
  const tunde = PROFILES.find((profile) => profile.id === "p2");
  assert.ok(adaeze && tunde);

  const closer = scoreProfile(adaeze, DEFAULT_MEMBER, DEFAULT_PREFERENCES);
  const farther = scoreProfile(tunde, DEFAULT_MEMBER, DEFAULT_PREFERENCES);

  assert.ok(closer.score > farther.score);
  assert.ok(closer.reasons.includes("Same city"));
  assert.ok(closer.reasons.includes("Similar church attendance"));
  assert.ok(closer.score <= 98);

  const scored = scoreProfile(tunde, DEFAULT_MEMBER, DEFAULT_PREFERENCES);
  assert.ok(scored.reasons.length > 0);
});

test("preferences exclude members outside the age range or with stricter requirements", () => {
  const tunde = PROFILES.find((profile) => profile.id === "p2");
  assert.ok(tunde);

  assert.equal(passesPreferences(tunde, DEFAULT_MEMBER, DEFAULT_PREFERENCES), true);
  assert.equal(passesPreferences(tunde, DEFAULT_MEMBER, { ...DEFAULT_PREFERENCES, ageMax: 30 }), false);
  assert.equal(
    passesPreferences(tunde, DEFAULT_MEMBER, {
      ...DEFAULT_PREFERENCES,
      denominationImportance: "Required",
    }),
    false
  );
  assert.equal(
    passesPreferences(tunde, DEFAULT_MEMBER, { ...DEFAULT_PREFERENCES, minVerification: 3 }),
    true
  );
});

test("discovery only surfaces opposite-gender profiles matching preferences", () => {
  const adaeze = PROFILES.find((profile) => profile.id === "p1");
  const tunde = PROFILES.find((profile) => profile.id === "p2");
  assert.ok(adaeze && tunde);

  assert.equal(isEligibleProfile(tunde, DEFAULT_MEMBER, DEFAULT_PREFERENCES), true);
  assert.equal(isEligibleProfile(adaeze, DEFAULT_MEMBER, DEFAULT_PREFERENCES), false);
});

test("the location list covers all 36 states plus the existing major cities", () => {
  const states = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];
  const locations = CITIES as readonly string[];
  states.forEach((state) => assert.ok(locations.includes(state), `${state} is missing`));
  ["Abuja", "Benin City", "Ibadan", "Port Harcourt"].forEach((city) =>
    assert.ok(locations.includes(city), `${city} is missing`)
  );
  assert.equal(new Set(locations).size, locations.length);
});

test("Igala is available as a language option", () => {
  assert.ok((LANGUAGES as readonly string[]).includes("Igala"));
});
