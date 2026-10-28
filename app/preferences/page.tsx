"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { ATTENDANCE, CITIES, DENOMINATION_IMPORTANCE } from "@/lib/data";
import { VERIFICATION_LABELS } from "@/lib/types";
import type { DenominationImportance, Preferences, VerificationLevel } from "@/lib/types";

export default function PreferencesPage() {
  const { state, updatePreferences, showToast } = useCovenant();
  const preferences = state.preferences;

  if (!state.member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Profile preferences</h1>
        <p className="mt-3 text-muted">Create a profile to set compatibility preferences and deal-breakers.</p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Create a profile
        </Link>
      </div>
    );
  }

  const update = (patch: Partial<Preferences>) => updatePreferences({ ...preferences, ...patch });

  const toggleCity = (city: string) => {
    const cities = preferences.cities.includes(city)
      ? preferences.cities.filter((item) => item !== city)
      : [...preferences.cities, city];
    update({ cities });
  };

  const toggleAttendance = (option: string) => {
    const attendance = preferences.attendance.includes(option)
      ? preferences.attendance.filter((item) => item !== option)
      : [...preferences.attendance, option];
    update({ attendance });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Preferences</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Profile preferences</h1>
      <p className="mt-2 text-muted">
        These preferences shape Discover. They are applied as filters, while compatibility scoring still
        explains every match.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Age range</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Minimum age</span>
              <input
                type="number"
                min={18}
                max={100}
                value={preferences.ageMin}
                onChange={(event) => {
                  const value = Math.max(18, Math.min(Number(event.target.value) || 18, preferences.ageMax));
                  update({ ageMin: value });
                }}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Maximum age</span>
              <input
                type="number"
                min={18}
                max={100}
                value={preferences.ageMax}
                onChange={(event) => {
                  const value = Math.max(preferences.ageMin, Number(event.target.value) || preferences.ageMin);
                  update({ ageMax: Math.min(100, value) });
                }}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Location</h2>
          <p className="mt-1 text-sm text-muted">Leave all unchecked to see every location.</p>
          <fieldset className="mt-4">
            <legend className="sr-only">Cities and states</legend>
            <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
              {CITIES.map((city) => {
                const active = preferences.cities.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCity(city)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-line bg-canvas text-ink"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Church attendance</h2>
          <p className="mt-1 text-sm text-muted">Leave all unchecked to see every attendance level.</p>
          <fieldset className="mt-4">
            <legend className="sr-only">Church attendance</legend>
            <div className="flex flex-wrap gap-2">
              {ATTENDANCE.map((option) => {
                const active = preferences.attendance.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAttendance(option)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-line bg-canvas text-ink"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Faith &amp; trust</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Importance of shared denomination
              </span>
              <select
                value={preferences.denominationImportance}
                onChange={(event) => update({ denominationImportance: event.target.value as DenominationImportance })}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {DENOMINATION_IMPORTANCE.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-muted">
                “Required” filters out other denominations. “Flexible” keeps everyone in view.
              </span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Minimum verification
              </span>
              <select
                value={preferences.minVerification}
                onChange={(event) => update({ minVerification: Number(event.target.value) as VerificationLevel })}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
              >
                {([0, 1, 2, 3] as const).map((level) => (
                  <option key={level} value={level}>
                    {VERIFICATION_LABELS[level]}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-muted">
                Filtering to photo or ID verified members strengthens trust.
              </span>
            </label>
          </div>
        </section>

        <div className="rounded-2xl border border-line bg-card p-6 text-sm text-muted">
          <p className="flex items-start gap-2">
            <SlidersHorizontal className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            Ethnicity and tribe are never used in ranking and are not part of these filters. Deal-breakers
            are explicit, optional and always visible to you.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/discover" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          See matches
        </Link>
        <button
          type="button"
          onClick={() => {
            update({
              ageMin: 24,
              ageMax: 40,
              cities: [],
              attendance: [],
              minVerification: 1,
              denominationImportance: "Prefer same",
            });
            showToast("Preferences reset to the recommended defaults.");
          }}
          className="rounded-full border border-line bg-card px-6 py-2.5 text-sm font-semibold text-ink"
        >
          Reset defaults
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">Changes apply immediately and are saved in this browser.</p>
    </div>
  );
}
