"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Lock, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { CITIES, DENOMINATIONS, PREMIUM_DAILY_INTERESTS, PROFILES } from "@/lib/data";
import { countDailyInterests, isEligibleProfile, remainingDailyInterests, scoreProfile } from "@/lib/domain";
import { incomingLikes } from "@/lib/notifications";
import { isEmailVerified } from "@/lib/safety";
import { ProfileCard } from "@/components/profile-card";
import { VerificationBadge } from "@/components/badges";
import { VERIFICATION_LABELS } from "@/lib/types";
import type { VerificationLevel } from "@/lib/types";

export default function Discover() {
  const { state } = useCovenant();
  const member = state.member;
  const { preferences, blocks, passes, interests, saves, premium } = state;

  const [city, setCity] = useState("");
  const [denomination, setDenomination] = useState("");
  const [minVerification, setMinVerification] = useState<VerificationLevel>(0);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    if (!member) return [];
    return PROFILES.filter(
      (profile) =>
        !blocks.includes(profile.id) &&
        !passes.includes(profile.id) &&
        !interests.includes(profile.id) &&
        !saves.includes(profile.id)
    )
      .filter((profile) => isEligibleProfile(profile, member, preferences))
      .filter((profile) => {
        if (city && profile.city !== city) return false;
        if (denomination && profile.denomination !== denomination) return false;
        if (profile.verified < minVerification) return false;
        if (query && !profile.firstName.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .map((profile) => ({ profile, ...scoreProfile(profile, member, preferences) }))
      .sort((a, b) => b.score - a.score);
  }, [member, preferences, blocks, passes, interests, saves, city, denomination, minVerification, query]);

  const savedProfiles = useMemo(() => {
    if (!member) return [];
    return PROFILES.filter((profile) => saves.includes(profile.id) && !blocks.includes(profile.id))
      .map((profile) => ({ profile, ...scoreProfile(profile, member, preferences) }))
      .sort((a, b) => b.score - a.score);
  }, [member, saves, blocks, preferences]);

  const likes = useMemo(() => {
    if (!member) return [];
    return incomingLikes(state).filter((profile) => profile.gender !== member.gender);
  }, [state, member]);

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Discover Christian singles</h1>
        <p className="mt-3 text-muted">
          Join Covenant to discover verified Christian singles curated for intentional courtship.
        </p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Join free
        </Link>
      </div>
    );
  }

  if (!state.onboarded) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Discover</h1>
        <p className="mt-3 text-muted">Complete onboarding to start discovering.</p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Continue onboarding
        </Link>
      </div>
    );
  }

  const dailyLimit = PREMIUM_DAILY_INTERESTS;
  const remaining = remainingDailyInterests(countDailyInterests(state.interestLog), premium);
  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);
  const filtersActive = Boolean(city || denomination || minVerification || query);
  const resetFilters = () => {
    setCity("");
    setDenomination("");
    setMinVerification(0);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Discover</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">Curated Christian singles</h1>
          <p className="mt-2 text-muted">
            {premium
              ? `${remaining} of ${dailyLimit} daily interests remaining (Premium)`
              : "Browsing is free. Matching and chat require Premium."}
          </p>
        </div>
        <Link
          href="/preferences"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Matching preferences
        </Link>
      </div>

      <div className="mt-4 rounded-lg bg-canvas p-3 text-xs text-muted">
        <span className="font-semibold text-ink">Your preferences: </span>
        ages {preferences.ageMin}–{preferences.ageMax} ·{" "}
        {preferences.cities.length ? preferences.cities.join(", ") : "any city"} ·{" "}
        {preferences.attendance.length ? preferences.attendance.join(", ") : "any attendance"} ·{" "}
        {preferences.minVerification > 0
          ? `${VERIFICATION_LABELS[preferences.minVerification]}+`
          : "any verification"}{" "}
        · denomination {preferences.denominationImportance.toLowerCase()}
      </div>

      {!premium && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
          <Lock className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="flex-1">
            Matching is part of Premium. Subscribe to express interest, open matches and chat.
          </span>
          <Link
            href="/subscription"
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            See plans
          </Link>
        </div>
      )}

      {premium && !emailVerified && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <span>
            Email verification is required before you can express interest.{" "}
            <Link href="/profile" className="font-semibold text-primary underline-offset-4 hover:underline">
              Verify your email
            </Link>
            .
          </span>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="fc">
              City or state
            </label>
            <select
              id="fc"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="">Any</option>
              {CITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="fd">
              Denomination
            </label>
            <select
              id="fd"
              value={denomination}
              onChange={(event) => setDenomination(event.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="">Any</option>
              {DENOMINATIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="fv">
              Minimum verification
            </label>
            <select
              id="fv"
              value={minVerification}
              onChange={(event) => setMinVerification(Number(event.target.value) as VerificationLevel)}
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              {([0, 1, 2, 3] as const).map((level) => (
                <option key={level} value={level}>
                  {VERIFICATION_LABELS[level]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="fn">
              Search by name
            </label>
            <input
              id="fn"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Tunde"
              className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <section id="likes-you" className="mt-8 rounded-2xl border border-gold/40 bg-gold/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-ink">People who expressed interest</h2>
            <p className="text-sm text-muted">
              {likes.length > 0
                ? moneyText(likes.length, premium)
                : "No new interest right now. A strong, complete profile helps."}
            </p>
          </div>
          {!premium && likes.length > 0 && (
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Unlock with Premium
            </Link>
          )}
        </div>

        {premium && likes.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {likes.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}

        {!premium && likes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {likes.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-serif font-bold text-primary-foreground">
                  {profile.firstName.charAt(0)}
                </span>
                <div className="text-sm">
                  <div className="font-semibold text-ink">Hidden until Premium</div>
                  <div className="text-xs text-muted">
                    {profile.city} · {profile.denomination}
                  </div>
                </div>
                <Lock className="h-4 w-4 text-muted" aria-hidden="true" />
              </div>
            ))}
          </div>
        )}
      </section>

      {savedProfiles.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl text-ink">Saved for later</h2>
          <p className="mt-1 text-sm text-muted">Saved profiles stay out of the daily list until you act on them.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {savedProfiles.map(({ profile }) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-ink">Your curated matches</h2>
        <p className="mt-1 text-sm text-muted">Ranked by faith, values, intent and your stated preferences.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map(({ profile }) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="mt-4 rounded-2xl border border-line bg-card p-8 text-center">
            <Heart className="mx-auto h-6 w-6 text-muted" aria-hidden="true" />
            <p className="mt-3 text-muted">
              No profiles fit these filters. Widen your preferences or clear the filters to see more members.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink"
                >
                  Clear filters
                </button>
              )}
              <Link
                href="/preferences"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                Adjust preferences
              </Link>
            </div>
          </div>
        )}
      </section>

      <p className="mt-8 text-center text-xs text-muted">
        Profiles are sample members for this demo. Real discovery would query the server and rank verified
        members only.
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted">
        <VerificationBadge level={state.verification} />
        <span>Your verification level affects visibility.</span>
      </div>
    </div>
  );
}

function moneyText(count: number, premium: boolean) {
  if (premium) {
    return `${count} ${count === 1 ? "member has" : "members have"} liked your profile. Respond below.`;
  }
  return `${count} ${count === 1 ? "member has" : "members have"} liked your profile. Premium reveals who.`;
}
