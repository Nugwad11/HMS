"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readLegacyDemoMember, useCovenant } from "@/lib/auth-store";
import LocateButton from "@/components/locate-button";
import {
  ATTENDANCE,
  CITIES,
  DENOMINATIONS,
  INTENTS,
  KIDS_OPTIONS,
  RELATIONSHIP_STATUSES,
} from "@/lib/data";
import type { Gender, MemberProfile } from "@/lib/types";
import { ageFromDob, isValidDob, isValidEmail } from "@/lib/safety";

const PHONE_RE = /^(\+?234|0)[789][01]\d{8}$/;

const STEP_LABELS = ["Account", "Covenant", "Profile"];

export default function SignUp() {
  const router = useRouter();
  const { registerAccount } = useCovenant();

  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactError, setContactError] = useState("");
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender>("Female");
  const [maritalStatus, setMaritalStatus] = useState<string>(RELATIONSHIP_STATUSES[0]);
  const [kids, setKids] = useState<string>("Open");
  const [intent, setIntent] = useState<string>("Christian courtship");
  const [profileError, setProfileError] = useState("");
  const [city, setCity] = useState<string>("Lagos");
  const [denomination, setDenomination] = useState<string>("Pentecostal");
  const [attendance, setAttendance] = useState<string>("Weekly+");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  const [verse, setVerse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the legacy browser demo after hydration so the server and
  // client first render stay identical.
  useEffect(() => {
    const legacy = readLegacyDemoMember();
    if (!legacy) return;
    queueMicrotask(() => {
      if (legacy.email) setEmail(legacy.email);
      if (legacy.firstName) setFirstName(legacy.firstName);
      if (legacy.dateOfBirth) setDateOfBirth(legacy.dateOfBirth);
      if (legacy.gender) setGender(legacy.gender);
      if (legacy.city) setCity(legacy.city);
      if (legacy.denomination) setDenomination(legacy.denomination);
      if (legacy.attendance) setAttendance(legacy.attendance);
      if (legacy.occupation) setOccupation(legacy.occupation);
      if (legacy.bio) setBio(legacy.bio);
      if (legacy.verse) setVerse(legacy.verse);
    });
  }, []);

  const continueFromAccount = () => {
    const normalised = phone.replace(/\D/g, "");
    if (!PHONE_RE.test(normalised)) {
      setContactError("Enter a valid Nigerian mobile number, for example 0803 123 4567.");
      return;
    }
    if (!isValidEmail(email)) {
      setContactError("Enter a valid email address. Verified email is required for safety notices.");
      return;
    }
    if (password.length < 10) {
      setContactError("Choose a password of at least 10 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setContactError("The two passwords do not match.");
      return;
    }
    setContactError("");
    setStep(1);
  };

  const finish = async () => {
    if (!firstName.trim()) {
      setProfileError("Enter the first name you want members to see.");
      return;
    }
    if (!isValidDob(dateOfBirth)) {
      setProfileError("Enter your date of birth. Covenant is for adults 18 and older.");
      return;
    }
    const parsedAge = ageFromDob(dateOfBirth);
    if (parsedAge === null) {
      setProfileError("Enter a valid date of birth.");
      return;
    }
    setProfileError("");
    const member: MemberProfile = {
      firstName: firstName.trim(),
      email: email.trim(),
      dateOfBirth,
      age: parsedAge,
      gender,
      city,
      country: "Nigeria",
      occupation: occupation.trim(),
      education: "",
      languages: ["English"],
      maritalStatus,
      kids,
      relocate: "Open to relocation",
      alcohol: "Prefer not to say",
      smoking: "Prefer not to say",
      careerAmbition: "",
      familyInvolvement: "Open",
      bio: bio.trim(),
      verse: verse.trim(),
      intent,
      denomination,
      churchName: "",
      churchCity: "",
      attendance,
      bornAgain: "",
      practices: [],
      courtshipViews: "Courtship leads to marriage",
      denominationImportance: "Prefer same",
      hideChurch: false,
      hideCity: false,
      hideEmployer: false,
      photo: null,
    };

    setSubmitting(true);
    const result = await registerAccount({
      email: email.trim(),
      password,
      phone: phone.trim(),
      profile: member,
    });
    setSubmitting(false);

    if (!result.ok) {
      setProfileError(result.message ?? "Could not create your account. Try again.");
      return;
    }
    router.push("/verify");
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Onboarding</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Welcome to Covenant</h1>
      <p className="mt-2 text-sm text-muted">
        A guided, resumable sign-up. Adulthood (18+) is required and your faith details are treated as
        sensitive data under the NDPA 2023. Your account and profile are stored on this device&apos;s
        server; SMS, ID checks and payments remain simulated in this demo.
      </p>

      <ol className="mt-6 flex items-center gap-2 text-xs text-muted" aria-label="Onboarding progress">
        {STEP_LABELS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                index <= step ? "bg-primary text-primary-foreground" : "border border-line bg-card"
              }`}
            >
              {index + 1}
            </span>
            <span className={index === step ? "font-semibold text-ink" : ""}>{label}</span>
            {index < STEP_LABELS.length - 1 && <span className="h-px w-4 bg-line" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Step 1 — Create your account</h2>
          <p className="mt-2 text-sm text-muted">
            A verified email is required for safety notices, including any account flag. Use a password you
            do not reuse elsewhere.
          </p>
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="ph">
            Phone number
          </label>
          <input
            id="ph"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="em">
            Email address
          </label>
          <input
            id="em"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="At least 10 characters"
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="pw2">
            Confirm password
          </label>
          <input
            id="pw2"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          {contactError && <p className="mt-2 text-sm text-bad">{contactError}</p>}
          <button
            type="button"
            onClick={continueFromAccount}
            className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Step 2 — Community covenant</h2>
          <p className="mt-2 text-sm text-muted">
            Be honest about who you are and what you want. Treat every member with dignity, and never ask
            for money or favours.
          </p>
          <label className="mt-4 flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={c1}
              onChange={(event) => setC1(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            I agree to the Terms and Privacy Policy, and consent to Covenant processing my faith details
            (sensitive data under the NDPA 2023).
          </label>
          <label className="mt-2 flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={c2}
              onChange={(event) => setC2(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            I accept the community covenant. My intent is courtship leading to marriage.
          </label>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-full border border-line bg-card px-6 py-3 text-sm font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!c1 || !c2}
              onClick={() => setStep(2)}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Step 3 — Tell us about you</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="n">
                First name
              </label>
              <input
                id="n"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="dob">
                Date of birth
              </label>
              <input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
              <p className="mt-1 text-xs text-muted">
                Used to confirm your age and cross-check the date of birth on your ID.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="g">
                Gender
              </label>
              <select
                id="g"
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="ms">
                Relationship status
              </label>
              <select
                id="ms"
                value={maritalStatus}
                onChange={(event) => setMaritalStatus(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {RELATIONSHIP_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="kids">
                Children
              </label>
              <select
                id="kids"
                value={kids}
                onChange={(event) => setKids(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {KIDS_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="intent">
                Relationship goal
              </label>
              <select
                id="intent"
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {INTENTS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="c">
                City or state
              </label>
              <select
                id="c"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {CITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <LocateButton className="mt-3" onLocation={setCity} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="d">
                Denomination
              </label>
              <select
                id="d"
                value={denomination}
                onChange={(event) => setDenomination(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {DENOMINATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink" htmlFor="at">
                Church attendance
              </label>
              <select
                id="at"
                value={attendance}
                onChange={(event) => setAttendance(event.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {ATTENDANCE.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-ink" htmlFor="pj">
              Occupation
            </label>
            <input
              id="pj"
              value={occupation}
              onChange={(event) => setOccupation(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-ink" htmlFor="pv">
              A verse that anchors me
            </label>
            <input
              id="pv"
              value={verse}
              onChange={(event) => setVerse(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-ink" htmlFor="pb">
              Short bio
            </label>
            <textarea
              id="pb"
              rows={3}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
          {profileError && <p className="mt-4 text-sm text-bad">{profileError}</p>}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-line bg-card px-6 py-3 text-sm font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting ? "Creating your account…" : "Create my account"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
