"use client";

import Link from "next/link";
import { Heart, Lock, MessageCircle, ShieldAlert, ShieldCheck, Sparkles, SlidersHorizontal } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { PROFILES } from "@/lib/data";
import { countDailyInterests, isEligibleProfile, remainingDailyInterests, scoreProfile } from "@/lib/domain";
import { incomingLikes } from "@/lib/notifications";
import { isEmailVerified } from "@/lib/safety";
import { VerificationBadge } from "@/components/badges";

export default function Dashboard() {
  const { state } = useCovenant();
  const member = state.member;

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Welcome to Covenant</h1>
        <p className="mt-3 text-muted">Sign in or create a profile to start your intentional courtship journey.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className="rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Join free
          </Link>
        </div>
      </div>
    );
  }

  if (!state.onboarded) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Complete your onboarding</h1>
        <p className="mt-3 text-muted">Finish the guided steps to unlock discovery and messaging.</p>
        <Link href="/signup" className="mt-6 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Continue onboarding
        </Link>
      </div>
    );
  }

  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);
  const completeness = Math.round(
    (
      [
        member.photo,
        member.firstName,
        member.bio,
        member.verse,
        member.occupation,
        member.denomination,
        member.attendance,
        member.maritalStatus,
        member.education,
        member.churchName,
        member.practices.length > 0 ? "yes" : "",
        member.languages.length > 1 ? "yes" : "",
        emailVerified ? "yes" : "",
        member.dateOfBirth,
      ].filter(Boolean).length / 14
    ) * 100
  );

  const usedToday = countDailyInterests(state.interestLog);
  const remaining = remainingDailyInterests(usedToday, state.premium);
  const likes = incomingLikes(state).filter((profile) => profile.gender !== member.gender);

  const dailyMatches = PROFILES.filter(
    (profile) =>
      !state.blocks.includes(profile.id) &&
      !state.passes.includes(profile.id) &&
      !state.interests.includes(profile.id) &&
      isEligibleProfile(profile, member, state.preferences)
  )
    .map((profile) => ({ profile, ...scoreProfile(profile, member, state.preferences) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          {member.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-serif text-2xl font-bold text-primary-foreground">
              {(member.firstName || "C").charAt(0)}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Member dashboard</p>
            <h1 className="mt-1 font-serif text-4xl text-ink">
              {member.firstName ? `Hello, ${member.firstName}.` : "Hello."}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {member.city} · {member.denomination} · {member.intent.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/discover" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Discover
          </Link>
          <Link
            href="/subscription"
            className="rounded-full border border-line bg-card px-6 py-3 text-sm font-semibold text-ink"
          >
            {state.premium ? "Manage Premium" : "Go Premium"}
          </Link>
        </div>
      </div>

      {!emailVerified && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink">
          <ShieldAlert className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          <span className="flex-1">
            Verify your email to express interest, message matches and receive account notices.
          </span>
          <Link href="/profile" className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground">
            Verify email
          </Link>
        </div>
      )}

      {!state.premium && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink">
          <Lock className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          <span className="flex-1">
            Matching is part of Premium. Subscribe to express interest, open matches and chat.
          </span>
          <Link href="/subscription" className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground">
            See plans
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Heart className="h-4 w-4" />} label="Matches" value={String(state.matches.length)} href="/matches" />
        <Stat
          icon={<Sparkles className="h-4 w-4" />}
          label={state.premium ? "Interests left today" : "Matching"}
          value={state.premium ? String(remaining) : "Premium"}
          href={state.premium ? "/discover" : "/subscription"}
        />
        <Stat icon={<Heart className="h-4 w-4" />} label="People who liked you" value={String(likes.length)} href="/discover#likes-you" />
        <Stat
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Verification"
          value={state.verification >= 3 ? "ID verified" : state.verification === 2 ? "Photo" : state.verification === 1 ? "Phone" : "None"}
          href="/verify"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink">Profile completeness</h2>
            <span className="font-serif text-xl font-bold text-ink">{completeness}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Add a photo, date of birth, email verification, church and spiritual practices to strengthen your
            profile.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/profile" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
              Edit profile
            </Link>
            <Link href="/verify" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Verification status
            </Link>
            <Link
              href="/preferences"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Preferences
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Your status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <VerificationBadge level={state.verification} />
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                emailVerified
                  ? "border-ok/40 bg-ok/10 text-ok"
                  : "border-gold/40 bg-gold/10 text-gold"
              }`}
            >
              {emailVerified ? "Email verified" : "Email unverified"}
            </span>
            {state.premium && (
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                Premium
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">
            {!emailVerified
              ? "Verify your email to unlock interests, messaging and ID checks."
              : !state.premium
                ? state.verification >= 2
                  ? "Community posting is unlocked. Premium unlocks matching and chat."
                  : "Premium unlocks matching and chat. Photo verification unlocks community posting."
                : state.verification >= 2
                  ? "Messaging and community posting are unlocked."
                  : "Complete photo verification to message your matches and post in rooms."}
          </p>
          <Link href="/verify" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
            {state.verification >= 2 ? "Review verification" : "Continue verification"}
          </Link>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl text-ink">Daily curated matches</h2>
            <p className="mt-1 text-sm text-muted">
              Top matches for you right now, ranked by faith, values, intent and preferences.
            </p>
          </div>
          <Link href="/discover" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            See all
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {dailyMatches.map(({ profile, score, reasons }) => (
            <div key={profile.id} className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg text-ink">
                  {profile.firstName}, {profile.age}
                </h3>
                <span className="font-serif text-lg font-bold text-gold">{score}%</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted">
                <span>{profile.city}</span>
                <span>·</span>
                <span>{profile.denomination}</span>
                <span>·</span>
                <span>{profile.attendance}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{profile.bio}</p>
              <p className="mt-2 text-xs text-muted">Why: {reasons.slice(0, 3).join(", ")}</p>
              <Link
                href="/discover"
                className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Express interest
              </Link>
            </div>
          ))}
          {dailyMatches.length === 0 && (
            <p className="text-sm text-muted">
              No new profiles match your preferences right now. Adjust your filters to see more members.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/matches" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Matches
          </Link>
          <Link href="/community" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
            Community rooms
          </Link>
          <Link href="/notifications" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
            Notifications
          </Link>
          <Link href="/account" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
            Account &amp; privacy
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-primary">
      <span className="inline-flex rounded-full border border-line p-2 text-primary">{icon}</span>
      <div className="mt-2 font-serif text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
    </Link>
  );
}
