"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Lock, MessageCircle, ShieldOff, Bookmark, BookmarkCheck } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { VerificationBadge } from "@/components/badges";
import { countDailyInterests, remainingDailyInterests, scoreProfile } from "@/lib/domain";
import { REPORT_REASONS } from "@/lib/data";
import { isEmailVerified } from "@/lib/safety";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  match?: boolean;
}

export function ProfileCard({ profile, match }: Props) {
  const router = useRouter();
  const {
    state,
    sendInterest,
    passProfile,
    saveProfile,
    reportProfile,
    blockProfile,
    showToast,
  } = useCovenant();

  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const member = state.member;

  if (!member) return null;

  const interested = state.interests.includes(profile.id);
  const passed = state.passes.includes(profile.id);
  const saved = state.saves.includes(profile.id);
  const isMatch = state.matches.includes(profile.id) || Boolean(match);
  const remaining = remainingDailyInterests(countDailyInterests(state.interestLog), state.premium);
  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);
  const { score, reasons } = scoreProfile(profile, member, state.preferences);

  const onInterest = () => {
    if (!state.premium) {
      showToast("Matching is part of Premium. Choose a plan to express interest.");
      router.push("/subscription");
      return;
    }
    if (!emailVerified) {
      showToast("Verify your email in your profile before expressing interest.");
      return;
    }
    if (remaining <= 0) {
      showToast("Daily interest limit reached. Premium raises it to 20 per day.");
      return;
    }
    const result = sendInterest(profile.id, note);
    if (result === "subscription-required") {
      showToast("Matching is part of Premium. Choose a plan to express interest.");
      router.push("/subscription");
      return;
    }
    if (result === "limit") {
      showToast("Daily interest limit reached. Premium raises it to 20 per day.");
      return;
    }
    if (result === "email-unverified") {
      showToast("Verify your email in your profile before expressing interest.");
      return;
    }
    if (result === "unavailable") return;
    showToast(
      result === "matched"
        ? `It’s a match with ${profile.firstName}! Open your matches to chat.`
        : `Interest sent to ${profile.firstName}. A match opens when interest is mutual.`
    );
    setShowNote(false);
    setNote("");
  };

  const onPass = () => {
    passProfile(profile.id);
    showToast(`Passed on ${profile.firstName}.`);
  };

  const onSave = () => {
    saveProfile(profile.id);
    showToast(saved ? `Removed ${profile.firstName} from saved.` : `Saved ${profile.firstName} for later.`);
  };

  const onReport = () => {
    reportProfile(profile.id, reportReason);
    showToast("Report sent to the Trust & Safety queue. High-risk reports are reviewed within 4 hours.");
  };

  const onBlock = () => {
    blockProfile(profile.id);
    showToast(`You blocked ${profile.firstName}. They will no longer appear for you.`);
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-lg font-bold text-primary-foreground">
            {profile.firstName.charAt(0)}
          </div>
          <div>
            <h3 className="font-serif text-lg leading-tight text-ink">
              {profile.firstName}, {profile.age}
            </h3>
            <div className="text-sm text-muted">
              {profile.city} · {profile.job}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-2xl font-bold text-gold">{score}%</div>
          <div className="text-xs text-muted">Compatibility</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <VerificationBadge level={profile.verified} />
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{profile.denomination}</span>
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{profile.attendance}</span>
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{profile.intent}</span>
      </div>

      <p className="mt-3 text-sm text-ink">{profile.bio}</p>
      <p className="mt-1 text-xs text-muted">Anchor verse: {profile.verse}</p>

      <div className="mt-3 rounded-lg bg-canvas p-3 text-xs text-muted">
        <span className="font-semibold text-ink">Why we matched you: </span>
        {reasons.join(", ")}
      </div>

      {profile.likesYou && !interested && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ok">
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          {profile.firstName} already expressed interest in you
        </p>
      )}

      <div className="mt-auto pt-4">
        {isMatch ? (
          state.premium ? (
            <Link
              href={`/matches/${profile.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Open chat
            </Link>
          ) : (
            <Link
              href="/subscription"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-semibold text-ink"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Subscribe to chat
            </Link>
          )
        ) : (
          <>
            {showNote && (
              <div className="mb-2">
                <label htmlFor={`note-${profile.id}`} className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Add a short note (optional)
                </label>
                <textarea
                  id={`note-${profile.id}`}
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, 180))}
                  rows={2}
                  placeholder={`A respectful hello to ${profile.firstName}…`}
                  className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={interested}
                onClick={onInterest}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                {interested
                  ? "Interest sent"
                  : !state.premium
                    ? "Subscribe to match"
                    : !emailVerified
                      ? "Verify email first"
                      : remaining === 0
                        ? "Daily limit reached"
                        : "Express interest"}
              </button>
              <button
                type="button"
                onClick={onPass}
                disabled={passed}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
              >
                {passed ? "Passed" : "Pass"}
              </button>
              <button
                type="button"
                onClick={onSave}
                aria-label={saved ? `Remove ${profile.firstName} from saved` : `Save ${profile.firstName}`}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink"
              >
                {saved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
              </button>
            </div>

            {!interested && !showNote && state.premium && (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Add a note to your interest
              </button>
            )}
          </>
        )}

        <details className="mt-3 border-t border-line pt-2 text-xs text-muted">
          <summary className="cursor-pointer select-none">Report or block</summary>
          <div className="mt-2 space-y-2">
            <label htmlFor={`report-${profile.id}`} className="block text-xs font-semibold text-ink">
              Report reason
            </label>
            <select
              id={`report-${profile.id}`}
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              className="w-full rounded-lg border border-line bg-canvas px-2 py-1.5 text-xs text-ink"
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onReport}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink"
              >
                Submit report
              </button>
              <button
                type="button"
                onClick={onBlock}
                className="inline-flex items-center gap-1 rounded-lg border border-bad/40 px-3 py-1.5 text-xs font-semibold text-bad"
              >
                <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
                Block {profile.firstName}
              </button>
            </div>
          </div>
        </details>
      </div>
    </article>
  );
}
