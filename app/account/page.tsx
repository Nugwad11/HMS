"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Mail, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { VerificationBadge } from "@/components/badges";
import { formatDob, isEmailVerified } from "@/lib/safety";
import { VERIFICATION_LABELS } from "@/lib/types";
import type { NotificationSettings } from "@/lib/types";

export default function Account() {
  const router = useRouter();
  const { state, updateMember, updateNotifications, deleteAccount, showToast } = useCovenant();
  const member = state.member;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Account &amp; privacy</h1>
        <p className="mt-3 text-muted">Sign in to manage your account, privacy and notification settings.</p>
        <Link href="/login" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "covenant-demo-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Your demo data has been downloaded.");
  };

  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);

  const confirmAccountDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    const result = await deleteAccount(deletePassword);
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.message ?? "Could not delete your account. Try again.");
      return;
    }
    showToast("Your account and demo data were deleted.");
    router.push("/");
  };

  const toggleNotification = (key: keyof NotificationSettings, checked: boolean) => {
    updateNotifications({ ...state.notifications, [key]: checked });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Account &amp; privacy</h1>
      <p className="mt-2 text-muted">
        Control what others see, manage notifications, and take your demo data with you.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">Verification</h2>
          <div className="mt-2">
            <VerificationBadge level={state.verification} />
          </div>
          <Link href="/verify" className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
            {state.verification >= 3 ? "View status" : "Complete verification"}
          </Link>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />
          <h2 className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">Membership</h2>
          <p className="mt-2 text-sm font-semibold text-ink">
            {state.premium ? "Premium active" : "Free plan · matching locked"}
          </p>
          <Link href="/subscription" className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
            {state.premium ? "Manage billing" : "Upgrade"}
          </Link>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="font-serif text-2xl font-bold text-ink">{state.matches.length}</div>
          <h2 className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">Active matches</h2>
          <Link href="/matches" className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
            View matches
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Member details</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail label="Name" value={member.firstName} />
          <Detail
            label="Email"
            value={member.email ? `${member.email} — ${emailVerified ? "verified" : "not verified"}` : "—"}
          />
          <Detail label="Date of birth" value={member.dateOfBirth ? formatDob(member.dateOfBirth) : "—"} />
          <Detail label="Age" value={String(member.age)} />
          <Detail label="City or state" value={member.city} />
          <Detail label="Denomination" value={member.denomination} />
          <Detail label="Relationship intent" value={member.intent} />
          <Detail label="Verification" value={VERIFICATION_LABELS[state.verification]} />
        </dl>
        {!emailVerified && (
          <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
            Your email is not verified, so interests, messaging and ID checks are locked and notices cannot
            be delivered.{" "}
            <Link href="/verify#email" className="font-semibold text-primary underline-offset-4 hover:underline">
              Verify your email
            </Link>
            .
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/profile" className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink">
            Edit profile
          </Link>
          <Link href="/preferences" className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink">
            Matching preferences
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Privacy preferences</h2>
        <p className="mt-1 text-sm text-muted">
          Hidden details are never shown to non-matches. Faith details are treated as sensitive data.
        </p>
        <div className="mt-4 space-y-2">
          <Toggle
            label="Hide my church name"
            description="Only matches can see your church name and city."
            checked={member.hideChurch}
            onChange={(checked) => updateMember({ ...member, hideChurch: checked })}
          />
          <Toggle
            label="Hide my exact location"
            description="Show only your general city area."
            checked={member.hideCity}
            onChange={(checked) => updateMember({ ...member, hideCity: checked })}
          />
          <Toggle
            label="Hide my employer"
            description="Keep your workplace private."
            checked={member.hideEmployer}
            onChange={(checked) => updateMember({ ...member, hideEmployer: checked })}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Notifications</h2>
        <p className="mt-1 text-sm text-muted">
          Push and SMS fallbacks are not connected in this demo. Email delivery is simulated in the demo
          inbox below.
        </p>
        <div className="mt-4 space-y-2">
          <Toggle
            label="New matches"
            description="Tell me when interest becomes mutual."
            checked={state.notifications.matches}
            onChange={(checked) => toggleNotification("matches", checked)}
          />
          <Toggle
            label="Messages"
            description="Tell me when a match sends a message."
            checked={state.notifications.messages}
            onChange={(checked) => toggleNotification("messages", checked)}
          />
          <Toggle
            label="Daily curated matches"
            description="A daily nudge when new matches are ready."
            checked={state.notifications.dailyMatches}
            onChange={(checked) => toggleNotification("dailyMatches", checked)}
          />
          <Toggle
            label="Product updates"
            description="Occasional news about Covenant features."
            checked={state.notifications.productUpdates}
            onChange={(checked) => toggleNotification("productUpdates", checked)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-ink">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            Demo email inbox
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {state.outbox.length} {state.outbox.length === 1 ? "message" : "messages"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          No email leaves this device. Verification codes, welcome mail and safety notices are delivered
          here so you can see exactly what the member would receive.
        </p>
        {state.outbox.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No messages yet. Verification and safety notices appear here.</p>
        ) : (
          <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto">
            {state.outbox.map((mail) => (
              <li key={mail.id} className="rounded-xl border border-line bg-canvas p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{mail.subject}</p>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                    {mail.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  To {mail.to} · {new Date(mail.at).toLocaleString()}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm text-muted">{mail.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Your data</h2>
        <p className="mt-1 text-sm text-muted">
          Your account and profile are stored on this device&apos;s server; simulated activity (matches,
          chat, flags and the demo inbox) stays in this browser. Exporting includes both. In production,
          all data is held server-side under the NDPA 2023 with access, correction, portability and
          deletion rights.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportData}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export my data
          </button>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-bad/40 px-5 py-2 text-sm font-semibold text-bad"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete my account
            </button>
          ) : (
            <div className="w-full rounded-xl border border-bad/40 bg-bad/5 p-3 text-sm text-ink">
              <p className="font-semibold">Delete your account, profile, matches, messages and settings?</p>
              <p className="mt-1 text-xs text-muted">
                This cannot be undone. The server account, its profile and the simulated demo data in this
                browser are all erased.
              </p>
              <label htmlFor="delete-password" className="mt-3 block text-xs font-semibold uppercase tracking-wide text-muted">
                Confirm with your password
              </label>
              <input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full max-w-xs rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
              {deleteError && <p className="mt-2 text-xs font-semibold text-bad">{deleteError}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={deleting || deletePassword.length === 0}
                  onClick={confirmAccountDelete}
                  className="rounded-full bg-bad px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes, delete everything"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Administration</h2>
        <p className="mt-1 text-sm text-muted">
          The admin console is permission-gated and logs every moderation action.
        </p>
        <Link href="/admin" className="mt-3 inline-block rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink">
          Open admin console
        </Link>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 rounded-lg bg-canvas px-3 py-2 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-line bg-canvas p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}
