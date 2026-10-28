"use client";

import Link from "next/link";
import { MailWarning, ShieldAlert } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { VerificationSteps } from "@/components/badges";
import { isEmailVerified, maskEmail } from "@/lib/safety";
import { SAFETY_FLAG_LABELS } from "@/lib/types";
import type { SafetyFlagStatus } from "@/lib/types";

const RED_FLAGS = [
  "Asks for money, airtime, gift cards or crypto.",
  "Pushes to WhatsApp or another app very quickly.",
  "Refuses to meet or do a video call.",
  "Professes love within days.",
];

const FIRST_DATE_TIPS = [
  "Meet in a busy public place, in daylight.",
  "Tell a trusted friend or family member where you are.",
  "Arrange your own transport.",
  "Leave if you feel pressured.",
];

const STATUS_LABELS: Record<SafetyFlagStatus, string> = {
  open: "Open — under review",
  upheld: "Upheld — confirmed",
  cleared: "Cleared — no action",
};

const STATUS_STYLES: Record<SafetyFlagStatus, string> = {
  open: "border-gold/50 bg-gold/10 text-ink",
  upheld: "border-bad/50 bg-bad/10 text-bad",
  cleared: "border-ok/50 bg-ok/10 text-ok",
};

export default function Safety() {
  const { state } = useCovenant();
  const member = state.member;
  const emailVerified = member ? isEmailVerified(member.email, state.verifiedEmail) : false;
  const memberFlags = state.flags.filter((flag) => flag.subjectId === "member");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">Safety &amp; verification</h1>
      <p className="mt-3 text-muted">
        Covenant treats safety and verification as foundations, not features. Here is how the community protects
        itself.
      </p>

      {member ? (
        <section className="mt-10 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Your Safety Centre</h2>
          <p className="mt-2 text-sm text-muted">Status: {state.verification >= 3 ? "ID verified" : `Tier ${state.verification} of 3 reached`}</p>

          <div className="mt-5 rounded-xl border border-line bg-canvas p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email for safety notices</p>
              {emailVerified ? (
                <span className="rounded-full border border-ok/50 bg-ok/10 px-2.5 py-0.5 text-xs font-semibold text-ok">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-bad/50 bg-bad/10 px-2.5 py-0.5 text-xs font-semibold text-bad">
                  <MailWarning className="h-3.5 w-3.5" aria-hidden="true" />
                  Not verified
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-ink">{member.email || "No email on file"}</p>
            <p className="mt-1 text-xs text-muted">
              {emailVerified
                ? "Flags on your account and identity checks are sent here. In this demo, mail lands in the demo inbox under Account."
                : "Verify your email to receive flag notices, send interest and chat. Chat, interests and ID checks stay locked until then."}
            </p>
            {!emailVerified && (
              <Link
                href="/profile"
                className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Verify your email
              </Link>
            )}
          </div>

          <div className="mt-6">
            <VerificationSteps />
          </div>

          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-serif text-xl text-ink">
              <ShieldAlert className="h-5 w-5 text-gold" aria-hidden="true" />
              Your account notices
            </h3>
            <p className="mt-1 text-sm text-muted">
              Automatic checks flag chats that ask for money, push off-platform or contradict your registration,
              and identity checks flag a date of birth that disagrees with the ID provided. A moderator reviews
              every flag before action is taken.
            </p>
            {memberFlags.length === 0 ? (
              <p className="mt-3 rounded-xl border border-line bg-canvas p-4 text-sm text-muted">
                No flags on your account. If one is raised, it will appear here and a notice will be emailed to
                your verified address.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {memberFlags.map((flag) => (
                  <li key={flag.id} className="rounded-xl border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{SAFETY_FLAG_LABELS[flag.kind]}</p>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[flag.status]}`}
                      >
                        {STATUS_LABELS[flag.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink">{flag.summary}</p>
                    {flag.evidence && (
                      <p className="mt-2 border-l-2 border-line pl-3 text-xs italic text-muted">
                        “{flag.evidence}”
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      Raised {new Date(flag.at).toLocaleString()} · {flag.severity} severity
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {flag.emailSentAt && flag.emailTo
                        ? `Notice emailed to ${maskEmail(flag.emailTo)} on ${new Date(flag.emailSentAt).toLocaleString()}.`
                        : emailVerified
                          ? "Chat flags are emailed only if a moderator upholds them."
                          : "No email sent — verify your email so notices can reach you."}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8">
            <h3 className="font-serif text-xl text-ink">Scam red flags</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              {RED_FLAGS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h3 className="font-serif text-xl text-ink">First-date safety</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              {FIRST_DATE_TIPS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h3 className="font-serif text-xl text-ink">Your reports</h3>
            {state.reports.length === 0 ? (
              <p className="mt-2 text-muted">No reports submitted yet. Use in-chat reporting for any concern.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {state.reports.map((r) => (
                  <li key={r.id}>
                    {r.reason} — {r.severity}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-8">
            <Link href="/subscription" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
              {state.premium ? "Manage membership" : "Go Premium"}
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Safety principles</h2>
          <p className="mt-2 text-muted">Before any relationship, know the red flags and first-date basics:</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-ink">Scam red flags</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                {RED_FLAGS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink">First-date safety</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                {FIRST_DATE_TIPS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <Link href="/signup" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
              Join to access the Safety Centre
            </Link>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">How chat safety checks work</h2>
        <p className="mt-2 text-sm text-muted">
          Every message sent through Covenant is checked against the details you registered with. Four kinds of
          concern are flagged for review:
        </p>
        <dl className="mt-4 space-y-3">
          <div className="rounded-xl border border-line bg-canvas p-4">
            <dt className="text-sm font-semibold text-ink">{SAFETY_FLAG_LABELS.financial}</dt>
            <dd className="mt-1 text-sm text-muted">
              A request for money, airtime, gift cards or crypto, account numbers or a currency amount paired with
              a request. High severity.
            </dd>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4">
            <dt className="text-sm font-semibold text-ink">{SAFETY_FLAG_LABELS["off-platform"]}</dt>
            <dd className="mt-1 text-sm text-muted">
              Pushing the conversation to WhatsApp, Telegram or another app, sharing a phone number, or sending a
              contact link. Keeps chats on the platform where reporting and blocking work.
            </dd>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4">
            <dt className="text-sm font-semibold text-ink">{SAFETY_FLAG_LABELS["profile-mismatch"]}</dt>
            <dd className="mt-1 text-sm text-muted">
              A claim in chat that contradicts registration: a different age, a different city, or a different
              denomination.
            </dd>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4">
            <dt className="text-sm font-semibold text-ink">{SAFETY_FLAG_LABELS["dob-mismatch"]}</dt>
            <dd className="mt-1 text-sm text-muted">
              The date of birth on the identity document provided does not match the profile date of birth. The
              account is flagged, the ID is not retained, and a notice goes to the verified email.
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Chat flags are not automatic punishments. A moderator upholds or clears each one, and the decision is
          written to the audit log. A flagged private message stays in that thread marked for review; a flagged
          community post is held rather than published.
        </p>
        <p className="mt-3 text-xs text-muted">
          This demo uses a transparent rule-based scanner with fixed patterns and simulated email. Production
          needs calibrated detection, staffed human review, false-positive appeals and an NDPA-compliant records
          policy — word matching alone would be unfair and easy to evade.
        </p>
      </section>
    </div>
  );
}
