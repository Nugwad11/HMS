"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { ADMIN_ACCESS_CODE, PROFILES } from "@/lib/data";
import { countDailyInterests } from "@/lib/domain";
import { SAFETY_FLAG_LABELS } from "@/lib/types";
import type { SafetyFlagStatus } from "@/lib/types";
import { VerificationBadge } from "@/components/badges";

const FLAG_STATUS_STYLES: Record<SafetyFlagStatus, string> = {
  open: "bg-gold/10 text-ink",
  upheld: "bg-bad/10 text-bad",
  cleared: "bg-ok/10 text-ok",
};

export default function Admin() {
  const {
    state,
    unlockAdmin,
    resolveReport,
    resolveFlag,
    resolveVerification,
    blockProfile,
    unblockProfile,
    resetDemo,
    showToast,
  } = useCovenant();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!state.adminUnlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Admin console</h1>
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <p className="flex items-start gap-2 text-sm text-muted">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            This console is permission-protected. In production it uses role-based access with an audit log
            for every action.
          </p>
          <label htmlFor="admin-code" className="mt-4 block text-sm font-semibold text-ink">
            Access code
          </label>
          <input
            id="admin-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (unlockAdmin(code)) {
                  showToast("Admin console unlocked.");
                } else {
                  setError("That access code is not valid.");
                }
              }
            }}
            placeholder="Enter admin code"
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          {error && <p className="mt-2 text-sm text-bad">{error}</p>}
          <button
            type="button"
            onClick={() => {
              if (unlockAdmin(code)) {
                setError("");
                showToast("Admin console unlocked.");
              } else {
                setError("That access code is not valid.");
              }
            }}
            className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Unlock console
          </button>
          <p className="mt-3 rounded-lg bg-canvas p-3 text-xs text-muted">
            Demo access code: <strong className="text-ink">{ADMIN_ACCESS_CODE}</strong>. This gate is a demo
            only and is not real security.
          </p>
        </div>
      </div>
    );
  }

  const verificationQueue = PROFILES.filter(
    (profile) => profile.verified === 2 && !state.verificationDecisions[profile.id]
  );
  const blockedProfiles = PROFILES.filter((profile) => state.blocks.includes(profile.id));
  const openFlags = state.flags.filter((flag) => flag.status === "open");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">Admin console</h1>
          <p className="mt-2 text-muted">Moderation, verification reviews and an audit trail. Demo data only.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
            Member dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              showToast("Demo data reset and admin console locked.");
            }}
            className="rounded-full border border-bad/40 bg-card px-5 py-2.5 text-sm font-semibold text-bad"
          >
            Reset demo data
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Open reports" value={state.reports.length} />
        <Metric label="Open safety flags" value={openFlags.length} />
        <Metric label="ID reviews waiting" value={verificationQueue.length} />
        <Metric label="Blocked members" value={state.blocks.length} />
        <Metric label="Interests sent today" value={countDailyInterests(state.interestLog)} />
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Reports queue</h2>
        <p className="mt-1 text-sm text-muted">
          High-risk reports are reviewed within 4 hours and standard reports within 24 hours.
        </p>
        {state.reports.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Queue is clear.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-semibold">Member</th>
                  <th className="px-3 py-2 font-semibold">Reason</th>
                  <th className="px-3 py-2 font-semibold">Risk</th>
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.reports.map((report) => (
                  <tr key={report.id} className="border-b border-line last:border-b-0 align-top">
                    <td className="px-3 py-3 text-ink">{report.profileName}</td>
                    <td className="px-3 py-3 text-muted">{report.reason}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          report.severity === "High" ? "bg-bad/10 text-bad" : "bg-canvas text-muted"
                        }`}
                      >
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            resolveReport(report.id, "Warn");
                            showToast(`${report.profileName} warned and logged.`);
                          }}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink"
                        >
                          Warn
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            resolveReport(report.id, "Suspend");
                            showToast(`${report.profileName} suspended and logged.`);
                          }}
                          className="rounded-full border border-bad/40 px-3 py-1 text-xs font-semibold text-bad"
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            resolveReport(report.id, "Dismiss");
                            showToast("Report dismissed and logged.");
                          }}
                          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Safety flags</h2>
        <p className="mt-1 text-sm text-muted">
          Raised automatically when a chat asks for money, pushes off-platform or contradicts registration, or
          when an ID date of birth disagrees with the profile. Every flag needs human review; uphold sends the
          member a notice at their verified email, and both decisions are logged.
        </p>
        {state.flags.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No flags raised.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-semibold">Member</th>
                  <th className="px-3 py-2 font-semibold">Flag</th>
                  <th className="px-3 py-2 font-semibold">Summary</th>
                  <th className="px-3 py-2 font-semibold">Risk</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.flags.map((flag) => (
                  <tr key={flag.id} className="border-b border-line last:border-b-0 align-top">
                    <td className="px-3 py-3 text-ink">{flag.subjectName}</td>
                    <td className="px-3 py-3 text-muted">{SAFETY_FLAG_LABELS[flag.kind]}</td>
                    <td className="px-3 py-3">
                      <p className="text-ink">{flag.summary}</p>
                      {flag.evidence && <p className="mt-1 text-xs italic text-muted">“{flag.evidence}”</p>}
                      <p className="mt-1 text-xs text-muted">
                        {new Date(flag.at).toLocaleString()}
                        {flag.emailSentAt ? ` · notice emailed` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          flag.severity === "High" ? "bg-bad/10 text-bad" : "bg-canvas text-muted"
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${FLAG_STATUS_STYLES[flag.status]}`}
                      >
                        {flag.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {flag.status === "open" ? (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              resolveFlag(flag.id, "Uphold");
                              showToast("Flag upheld, notice emailed and logged.");
                            }}
                            className="rounded-full border border-bad/40 px-3 py-1 text-xs font-semibold text-bad"
                          >
                            Uphold
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resolveFlag(flag.id, "Clear");
                              showToast("Flag cleared and logged.");
                            }}
                            className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">ID verification reviews</h2>
        <p className="mt-1 text-sm text-muted">
          Manual fallback for photo-verified members awaiting ID review. Demo profiles only.
        </p>
        {verificationQueue.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No reviews waiting.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {verificationQueue.map((profile) => (
              <div key={profile.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                <div>
                  <div className="font-semibold text-ink">{profile.firstName}</div>
                  <div className="text-sm text-muted">
                    {profile.city} · {profile.denomination} · submitted NIN slip (sample)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VerificationBadge level={profile.verified} />
                  <button
                    type="button"
                    onClick={() => {
                      resolveVerification(profile.id, "approved");
                      showToast(`${profile.firstName} approved and logged.`);
                    }}
                    className="rounded-full border border-ok/40 px-3 py-1 text-xs font-semibold text-ok"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resolveVerification(profile.id, "rejected");
                      showToast(`${profile.firstName} rejected and logged.`);
                    }}
                    className="rounded-full border border-bad/40 px-3 py-1 text-xs font-semibold text-bad"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Blocked members</h2>
        {blockedProfiles.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No blocked members.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {blockedProfiles.map((profile) => (
              <span key={profile.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-sm text-ink">
                {profile.firstName} ({profile.id})
                <button
                  type="button"
                  onClick={() => {
                    unblockProfile(profile.id);
                    showToast(`${profile.firstName} unblocked.`);
                  }}
                  className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Unblock
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Members</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-semibold">Member</th>
                <th className="px-3 py-2 font-semibold">City or state</th>
                <th className="px-3 py-2 font-semibold">Denomination</th>
                <th className="px-3 py-2 font-semibold">Verification</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PROFILES.map((profile) => (
                <tr key={profile.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2 text-ink">{profile.firstName}</td>
                  <td className="px-3 py-2 text-muted">{profile.city}</td>
                  <td className="px-3 py-2 text-muted">{profile.denomination}</td>
                  <td className="px-3 py-2">
                    <VerificationBadge level={profile.verified} />
                  </td>
                  <td className="px-3 py-2">
                    {state.blocks.includes(profile.id) ? (
                      <span className="text-xs font-semibold text-bad">Blocked</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          blockProfile(profile.id);
                          showToast(`${profile.firstName} blocked.`);
                        }}
                        className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink"
                      >
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-ink">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          Audit log
        </h2>
        {state.auditLog.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No admin actions yet.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            {state.auditLog.map((entry, index) => (
              <li key={`${entry}-${index}`} className="rounded-lg bg-canvas px-3 py-2">
                {entry}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="font-serif text-3xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
