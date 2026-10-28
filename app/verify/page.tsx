"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock, Mail, MailCheck, MailWarning, ShieldCheck } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { VerificationBadge } from "@/components/badges";
import { formatDob, isEmailVerified, isValidDob, maskEmail } from "@/lib/safety";
import { VERIFICATION_LABELS } from "@/lib/types";

export default function Verify() {
  const { state, verifyPhone, verifyPhoto, submitIdCheck, requestEmailCode, confirmEmailCode, showToast } =
    useCovenant();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [nin, setNin] = useState("");
  const [idDob, setIdDob] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const member = state.member;

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Verification</h1>
        <p className="mt-3 text-muted">Create a profile first, then verify your phone, photo and ID.</p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Create a profile
        </Link>
      </div>
    );
  }

  const tier = state.verification;
  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);
  const demoCode = state.emailCode?.code ?? null;

  const sendEmailCode = async () => {
    setEmailBusy(true);
    const result = await requestEmailCode();
    setEmailBusy(false);
    showToast(
      result.ok
        ? result.demoCode
          ? `Demo code ready: ${result.demoCode}`
          : "Verification code sent."
        : result.message ?? "Could not send a verification code."
    );
  };

  const confirmEmail = async () => {
    setEmailBusy(true);
    const result = await confirmEmailCode(emailInput.trim());
    setEmailBusy(false);
    if (!result.ok) {
      showToast(result.message ?? "That code could not be verified.");
      return;
    }
    setEmailInput("");
    showToast("Email verified. Safety notices and interest requests are unlocked.");
  };

  const resendCode = () => {
    setOtpSent(true);
    showToast("Demo code sent. Enter 123456 to confirm your phone.");
  };

  const confirmPhone = () => {
    if (otp.trim() !== "123456") {
      showToast("That code is wrong. Use 123456 in this demo.");
      return;
    }
    verifyPhone();
    showToast("Phone verified. Tier 1 complete.");
  };

  const completePhoto = () => {
    verifyPhoto();
    showToast("Photo verification complete. Messaging and room posting are unlocked.");
  };

  const completeId = () => {
    if (!/^\d{11}$/.test(nin)) {
      showToast("Enter a valid 11-digit NIN. In production a licensed KYC provider verifies it.");
      return;
    }
    if (!emailVerified) {
      showToast("Verify your email before submitting an ID check.");
      return;
    }
    if (!member.dateOfBirth) {
      showToast("Add your date of birth to your profile before the ID check.");
      return;
    }
    if (!isValidDob(idDob)) {
      showToast("Enter the date of birth printed on the ID.");
      return;
    }

    const outcome = submitIdCheck(idDob);
    if (outcome === "match") {
      setNin("");
      setIdDob("");
      showToast("ID verification complete. Your Verified badge is live.");
      return;
    }
    if (outcome === "mismatch") {
      showToast(
        `Date of birth does not match your profile. Account flagged; a notice was emailed to ${maskEmail(
          member.email
        )}.`
      );
      return;
    }
    showToast("Verify your email, add your date of birth and complete photo verification first.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Verification</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Verification &amp; trust</h1>
      <p className="mt-2 text-muted">
        Complete each tier to unlock messaging, the Verified badge and priority visibility.
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        <div className="text-sm">
          <span className="font-semibold text-ink">Current status: </span>
          {VERIFICATION_LABELS[tier]}
        </div>
        <div className="ml-auto">
          <VerificationBadge level={tier} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm">
        {emailVerified ? (
          <MailCheck className="h-4 w-4 text-ok" aria-hidden="true" />
        ) : (
          <MailWarning className="h-4 w-4 text-gold" aria-hidden="true" />
        )}
        <span className="text-ink">
          {emailVerified
            ? `Email verified: ${member.email}`
            : "Email not verified — verification codes and safety notices cannot be delivered."}
        </span>
        {!emailVerified && (
          <a href="#email" className="font-semibold text-primary underline-offset-4 hover:underline">
            Verify email
          </a>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <section id="email" className="rounded-2xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                Email verification
              </h2>
              <p className="text-sm text-muted">
                Required before expressing interest, chatting, submitting an ID check or receiving any
                safety notice.
              </p>
            </div>
            <Status done={emailVerified} />
          </div>
          <p className="mt-3 text-sm text-ink">
            {emailVerified ? (
              <>Verified: {member.email}</>
            ) : (
              <>Not verified: {member.email}</>
            )}
          </p>

          {!emailVerified && (
            <div className="mt-4 space-y-3">
              <p className="rounded-lg bg-gold/10 p-3 text-sm text-ink">
                Demo mode: no email leaves this device. Requesting a code stores a new 6-digit code on the
                server for 10 minutes; the demo build shows it here and in your demo inbox.
              </p>
              <button
                type="button"
                disabled={emailBusy}
                onClick={sendEmailCode}
                className="rounded-full border border-line bg-card px-5 py-2 text-sm font-semibold text-ink disabled:opacity-50"
              >
                {demoCode ? "Send a new code" : "Send verification code"}
              </button>

              {demoCode && (
                <p className="text-sm text-ink">
                  Demo code:{" "}
                  <strong className="rounded bg-canvas px-2 py-1 font-mono text-base tracking-widest text-primary">
                    {demoCode}
                  </strong>{" "}
                  <span className="text-xs text-muted">expires in 10 minutes</span>
                </p>
              )}

              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label htmlFor="email-code" className="block text-xs font-semibold uppercase tracking-wide text-muted">
                    Email code
                  </label>
                  <input
                    id="email-code"
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    className="mt-1 w-40 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
                  />
                </div>
                <button
                  type="button"
                  disabled={emailBusy || emailInput.length !== 6}
                  onClick={confirmEmail}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Confirm email
                </button>
              </div>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl text-ink">Tier 1 — Phone</h2>
              <p className="text-sm text-muted">Confirm your Nigerian mobile number with a one-time code.</p>
            </div>
            <Status done={tier >= 1} />
          </div>
          {tier < 1 && (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={resendCode}
                className="rounded-full border border-line bg-card px-5 py-2 text-sm font-semibold text-ink"
              >
                Send demo code
              </button>
              {otpSent && (
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wide text-muted">
                      One-time code
                    </label>
                    <input
                      id="otp"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      className="mt-1 w-40 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={confirmPhone}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Confirm phone
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl text-ink">Tier 2 — Photo</h2>
              <p className="text-sm text-muted">
                A live selfie matched to your profile photo unlocks messaging and room posting.
              </p>
            </div>
            <Status done={tier >= 2} />
          </div>
          {tier < 2 && (
            <>
              <p className="mt-4 rounded-lg bg-gold/10 p-3 text-sm text-ink">
                Demo mode: no liveness provider is connected, so this button records a sample verification.
                Production must verify a live selfie with a licensed provider.
              </p>
              <button
                type="button"
                disabled={tier < 1}
                onClick={completePhoto}
                className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Complete photo verification (demo)
              </button>
              {tier < 1 && <p className="mt-2 text-xs text-muted">Complete Tier 1 first.</p>}
            </>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl text-ink">Tier 3 — ID</h2>
              <p className="text-sm text-muted">
                NIN, driver’s licence, voter’s card or passport through a licensed KYC provider.
              </p>
            </div>
            <Status done={tier >= 3} />
          </div>
          {tier < 3 && (
            <>
              <p className="mt-4 rounded-lg bg-gold/10 p-3 text-sm text-ink">
                Demo mode: your NIN is only length-checked and is never stored. The ID date of birth is used
                only for this comparison and is not stored. In production a licensed provider verifies both
                over an encrypted connection.
              </p>

              {!emailVerified ? (
                <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
                  Verify your email before submitting an ID check, so any flag or decision notice can reach
                  you.{" "}
                  <a href="#email" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Verify email
                  </a>
                </div>
              ) : (
                <>
                  {!member.dateOfBirth && (
                    <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
                      Add your date of birth to your profile first.{" "}
                      <Link href="/profile" className="font-semibold text-primary underline-offset-4 hover:underline">
                        Add date of birth
                      </Link>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    <div>
                      <label htmlFor="nin" className="block text-xs font-semibold uppercase tracking-wide text-muted">
                        NIN (11 digits)
                      </label>
                      <input
                        id="nin"
                        value={nin}
                        onChange={(event) => setNin(event.target.value.replace(/\D/g, "").slice(0, 11))}
                        inputMode="numeric"
                        maxLength={11}
                        disabled={tier < 2}
                        placeholder="12345678901"
                        className="mt-1 w-48 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="id-dob" className="block text-xs font-semibold uppercase tracking-wide text-muted">
                        Date of birth on the ID
                      </label>
                      <input
                        id="id-dob"
                        type="date"
                        value={idDob}
                        onChange={(event) => setIdDob(event.target.value)}
                        disabled={tier < 2}
                        className="mt-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={tier < 2 || !member.dateOfBirth}
                      onClick={completeId}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      Verify ID (demo)
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    The ID date of birth is compared with your profile ({formatDob(member.dateOfBirth)}). A
                    mismatch opens a safety flag and emails you a notice.
                  </p>
                </>
              )}

              {state.lastIdCheck && !state.lastIdCheck.matched && (
                <div className="mt-4 rounded-lg border border-bad/40 bg-bad/5 p-3 text-sm text-ink">
                  <p className="font-semibold text-bad">Last ID check did not match</p>
                  <p className="mt-1 text-muted">
                    On {new Date(state.lastIdCheck.at).toLocaleString()}, the date of birth on the ID differed
                    from your profile ({formatDob(state.lastIdCheck.profileDob)}). Your account is flagged and
                    a notice was emailed to {member.email}.
                  </p>
                  <Link href="/safety" className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
                    View the notice
                  </Link>
                </div>
              )}

              {tier < 2 && <p className="mt-2 text-xs text-muted">Complete photo verification first.</p>}
            </>
          )}
          {tier >= 3 && <p className="mt-4 text-sm text-ok">Verified badge active. ID details are not visible to other members.</p>}
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          Back to dashboard
        </Link>
        <Link href="/safety" className="rounded-full border border-line bg-card px-6 py-2.5 text-sm font-semibold text-ink">
          Safety centre
        </Link>
      </div>
    </div>
  );
}

function Status({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-3 py-1 text-xs font-semibold text-ok">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      Complete
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
      Pending
    </span>
  );
}
