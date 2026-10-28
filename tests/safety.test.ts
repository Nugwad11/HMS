import assert from "node:assert/strict";
import test from "node:test";
import {
  ageFromDob,
  dobMatches,
  formatDob,
  isEmailVerified,
  isValidDob,
  isValidEmail,
  maskEmail,
  normalizeDob,
  scanMessage,
} from "../lib/safety.ts";

const CONTEXT = { age: 28, city: "Abuja", denomination: "Pentecostal" };

test("a financial request is flagged as high severity", () => {
  const findings = scanMessage("Please send me ₦50,000 for my school fees.", CONTEXT);
  const financial = findings.find((finding) => finding.kind === "financial");
  assert.ok(financial);
  assert.equal(financial.severity, "High");
  assert.match(financial.summary, /money|financial/i);
});

test("financial requests are caught without a currency symbol", () => {
  const findings = scanMessage("Can you help me with airtime and transport fare?", CONTEXT);
  assert.equal(findings.filter((finding) => finding.kind === "financial").length, 1);
});

test("bank account details are treated as a financial request", () => {
  const findings = scanMessage("My account number is 0123456789", CONTEXT);
  assert.ok(findings.some((finding) => finding.kind === "financial"));
});

test("moving the chat off Covenant is flagged once", () => {
  const findings = scanMessage(
    "Let's move this chat to WhatsApp, my number is 08031234567.",
    CONTEXT
  );
  assert.equal(findings.filter((finding) => finding.kind === "off-platform").length, 1);
});

test("contact sharing and links are flagged as off-platform", () => {
  assert.ok(
    scanMessage("Email me at grace@example.com", CONTEXT).some(
      (finding) => finding.kind === "off-platform"
    )
  );
  assert.ok(
    scanMessage("Find me at https://example.com/grace", CONTEXT).some(
      (finding) => finding.kind === "off-platform"
    )
  );
});

test("an age claim that contradicts registration is flagged", () => {
  const findings = scanMessage("I'm 35 years old, by the way.", CONTEXT);
  const mismatch = findings.find((finding) => finding.kind === "profile-mismatch");
  assert.ok(mismatch);
  assert.match(mismatch.summary, /35/);
  assert.match(mismatch.summary, /28/);
});

test("a matching age claim is not flagged", () => {
  const findings = scanMessage("I am 28 years old.", CONTEXT);
  assert.equal(findings.length, 0);
});

test("a different city claim is flagged", () => {
  const findings = scanMessage("I live in Lagos, near the island.", CONTEXT);
  const mismatch = findings.find((finding) => finding.kind === "profile-mismatch");
  assert.ok(mismatch);
  assert.match(mismatch.summary, /Lagos/);
  assert.match(mismatch.summary, /Abuja/);
});

test("the registered city is not flagged", () => {
  const findings = scanMessage("I live in Abuja and attend a Pentecostal church.", CONTEXT);
  assert.equal(findings.length, 0);
});

test("a different denomination claim is flagged", () => {
  const findings = scanMessage("I am Catholic, but I visit other churches too.", CONTEXT);
  const mismatch = findings.find((finding) => finding.kind === "profile-mismatch");
  assert.ok(mismatch);
  assert.match(mismatch.summary, /Catholic/);
  assert.match(mismatch.summary, /Pentecostal/);
});

test("an ordinary faith-led message raises no flags", () => {
  const findings = scanMessage(
    "How was service on Sunday? I would love to hear how your week has been.",
    CONTEXT
  );
  assert.deepEqual(findings, []);
});

test("normalizeDob rejects impossible and malformed dates", () => {
  assert.equal(normalizeDob("1998-03-14"), "1998-03-14");
  assert.equal(normalizeDob("1998-02-30"), null);
  assert.equal(normalizeDob("14/03/1998"), null);
  assert.equal(normalizeDob(""), null);
});

test("dobMatches compares the profile date with the ID date", () => {
  assert.equal(dobMatches("1998-03-14", "1998-03-14"), true);
  assert.equal(dobMatches("1998-03-14", "1998-03-15"), false);
  assert.equal(dobMatches("1998-03-14", ""), false);
});

test("ageFromDob counts birthdays correctly", () => {
  assert.equal(ageFromDob("1998-03-14", new Date(2026, 2, 13)), 27);
  assert.equal(ageFromDob("1998-03-14", new Date(2026, 2, 14)), 28);
  assert.equal(ageFromDob("not-a-date"), null);
});

test("isValidDob enforces the 18 to 100 age range", () => {
  const now = new Date(2026, 9, 27);
  assert.equal(isValidDob("2009-01-01", now), false);
  assert.equal(isValidDob("2008-10-27", now), true);
  assert.equal(isValidDob("1920-01-01", now), false);
});

test("formatDob renders a readable date", () => {
  assert.equal(formatDob("1998-03-14"), "14 March 1998");
  assert.equal(formatDob("bogus"), "not set");
});

test("email validation and verification are strict", () => {
  assert.equal(isValidEmail("grace@example.com"), true);
  assert.equal(isValidEmail("grace@example"), false);
  assert.equal(isValidEmail("grace @example.com"), false);
  assert.equal(isEmailVerified("Grace@Example.com", "grace@example.com"), true);
  assert.equal(isEmailVerified("grace@example.com", null), false);
  assert.equal(isEmailVerified("", "grace@example.com"), false);
});

test("maskEmail hides the local part of the address", () => {
  assert.equal(maskEmail("grace@example.com"), "g****@example.com");
  assert.equal(maskEmail("a@b.co"), "a*@b.co");
});
