"use client";

import Link from "next/link";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { FREE_FEATURES, PREMIUM_FEATURES, PREMIUM_PLANS } from "@/lib/data";

const COMPARISON = [
  { feature: "Browse and filter profiles", free: true, premium: true },
  { feature: "Save and revisit profiles", free: true, premium: true },
  { feature: "Express interest and open matches", free: false, premium: true },
  { feature: "Private chat with mutual matches", free: false, premium: true },
  { feature: "Expressions of interest per day", free: "None", premium: "Up to 20" },
  { feature: "See who expressed interest in you", free: false, premium: true },
  { feature: "Advanced filters and deal-breakers", free: false, premium: true },
  { feature: "Weekly profile boost", free: false, premium: true },
  { feature: "Read receipts and priority support", free: false, premium: true },
  { feature: "Community rooms, reporting and blocking", free: true, premium: true },
];

export default function Membership() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Membership</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Membership &amp; pricing</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Free membership lets you browse verified Christian singles safely. Premium unlocks matching and
          private chat for members who are ready to pursue courtship.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-8">
          <h2 className="font-serif text-3xl text-ink">Free</h2>
          <p className="mt-1 text-muted">Browse verified profiles and join the community.</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-serif text-5xl font-bold text-ink">₦0</span>
            <span className="pb-2 text-muted">forever</span>
          </div>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 text-muted" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-8 block rounded-full border border-line bg-card py-3.5 text-center font-semibold text-ink"
          >
            Join free
          </Link>
        </div>

        <div className="rounded-2xl border border-primary bg-card p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl text-ink">Premium</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              Most popular
            </span>
          </div>
          <p className="mt-1 text-muted">Match, chat and control who you meet.</p>
          <div className="mt-5 space-y-3">
            {PREMIUM_PLANS.map((plan) => (
              <div key={plan.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-canvas px-4 py-3">
                <div>
                  <span className="font-semibold text-ink">{plan.name}</span>
                  <span className="ml-2 text-xs text-muted">{plan.tagline}</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-ink">{plan.price}</span>
                  <span className="text-xs text-muted">{plan.period}</span>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-6 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 text-ok" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/subscription"
            className="mt-8 block rounded-full bg-primary py-3.5 text-center font-semibold text-primary-foreground"
          >
            Go Premium
          </Link>
        </div>
      </div>

      <section className="mt-12 overflow-hidden rounded-2xl border border-line bg-card">
        <h2 className="px-6 pt-6 font-serif text-2xl text-ink">Compare plans</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-semibold">Feature</th>
                <th className="px-6 py-3 text-center font-semibold">Free</th>
                <th className="px-6 py-3 text-center font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-b-0">
                  <td className="px-6 py-3 text-ink">{row.feature}</td>
                  <td className="px-6 py-3 text-center text-muted">
                    {typeof row.free === "boolean" ? (
                      row.free ? (
                        <Check className="mx-auto h-4 w-4 text-ok" aria-label="Included" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted" aria-label="Not included" />
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="px-6 py-3 text-center text-muted">
                    {typeof row.premium === "boolean" ? (
                      row.premium ? (
                        <Check className="mx-auto h-4 w-4 text-ok" aria-label="Included" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted" aria-label="Not included" />
                      )
                    ) : (
                      row.premium
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 rounded-2xl border border-line bg-card p-8">
        <h2 className="font-serif text-2xl text-ink">Payment details</h2>
        <p className="mt-2 text-muted">
          These are the indicative prices from the product brief. This build is a demo: no Paystack or
          Flutterwave account is connected, so checkout, receipts, cancellations, refunds and paid
          entitlements are simulated and stay in this browser.
        </p>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-muted" aria-hidden="true" />
          In production, all paid entitlements are granted server-side after a verified payment webhook.
          The frontend never unlocks Premium on its own.
        </p>
      </div>
    </div>
  );
}
