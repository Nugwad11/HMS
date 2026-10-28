"use client";

import Link from "next/link";
import { Bell, Heart, Info, Sparkles } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { buildNotifications } from "@/lib/notifications";

export default function Notifications() {
  const { state } = useCovenant();

  if (!state.member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Notifications</h1>
        <p className="mt-3 text-muted">Sign in to see match, verification and membership updates.</p>
        <Link href="/login" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const all = buildNotifications(state);
  const items = all.filter((item) => {
    if (item.tone === "match") return state.notifications.matches;
    if (item.id === "daily-matches") return state.notifications.dailyMatches;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Notifications</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">Your updates</h1>
          <p className="mt-2 text-muted">A calm feed of what needs your attention — no pressure tactics.</p>
        </div>
        <Link href="/account" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
          Notification settings
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {items.map((item) => {
          const Icon = item.tone === "match" ? Heart : item.tone === "action" ? Bell : Sparkles;
          const tone =
            item.tone === "match"
              ? "border-ok/40 bg-ok/5 text-ok"
              : item.tone === "action"
                ? "border-gold/40 bg-gold/5 text-gold"
                : "border-line bg-card text-muted";
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-start gap-3 rounded-2xl border p-5 transition-colors hover:border-primary ${tone}`}
            >
              <span className="mt-0.5 rounded-full border border-current/30 p-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-serif text-lg text-ink">{item.title}</span>
                <span className="mt-1 block text-sm text-muted">{item.body}</span>
              </span>
              <span className="mt-1 text-xs font-semibold text-primary">Open →</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-card p-4 text-xs text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <span>
          Push, email and SMS delivery are not connected in this demo. Production notifications respect
          quiet hours and granular preferences.
        </span>
      </div>
    </div>
  );
}
