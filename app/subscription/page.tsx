"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { PREMIUM_FEATURES, PREMIUM_PLANS } from "@/lib/data";
import { countDailyInterests, remainingDailyInterests } from "@/lib/domain";

const PAYMENT_METHODS = ["Card (Paystack demo)", "Bank transfer (demo)", "USSD (demo)"];

export default function Subscription() {
  const { state, activatePremium, cancelPremium, showToast } = useCovenant();
  const [selectedPlan, setSelectedPlan] = useState<string>(PREMIUM_PLANS[0].id);
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

  if (!state.member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Subscription &amp; billing</h1>
        <p className="mt-3 text-muted">Create a profile to manage membership.</p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Join free
        </Link>
      </div>
    );
  }

  const plan = PREMIUM_PLANS.find((candidate) => candidate.id === (state.premiumPlan ?? selectedPlan)) ?? PREMIUM_PLANS[0];
  const usedToday = countDailyInterests(state.interestLog);

  if (state.premium) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Membership</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Subscription &amp; billing</h1>

        <div className="mt-8 rounded-2xl border border-primary bg-card p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Sparkles className="h-6 w-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-3xl text-ink">You are on Premium</h2>
          </div>
          <p className="mt-2 text-muted">
            {plan.name} plan · {plan.price}
            {plan.period}.{" "}
            {state.premiumSince
              ? `Since ${new Date(state.premiumSince).toLocaleDateString()}.`
              : "Active on this device."}
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-canvas p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Interests today</dt>
              <dd className="mt-1 font-serif text-2xl font-bold text-ink">{usedToday} / 20</dd>
            </div>
            <div className="rounded-xl bg-canvas p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Remaining today</dt>
              <dd className="mt-1 font-serif text-2xl font-bold text-ink">
                {remainingDailyInterests(usedToday, true)}
              </dd>
            </div>
            <div className="rounded-xl bg-canvas p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Plan</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{plan.name}</dd>
            </div>
          </dl>

          <ul className="mt-6 space-y-2">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 text-ok" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/discover" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
              Discover with Premium
            </Link>
            <button
              type="button"
              onClick={() => {
                cancelPremium();
                showToast("Premium cancelled (demo). Matching and chat are locked again; your matches stay saved.");
              }}
              className="rounded-full border border-line bg-card px-6 py-2.5 text-sm font-semibold text-ink"
            >
              Cancel Premium (demo)
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          Demo billing: no payment was taken and no renewal will occur. Production checkout, receipts,
          retries and cancellation are handled server-side with Paystack.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Membership</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Subscription &amp; billing</h1>
      <p className="mt-2 text-muted">
        Premium unlocks matching and chat. Choose a plan, then complete a clearly labelled demo checkout.
        No payment is taken.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {PREMIUM_PLANS.map((option) => {
          const active = selectedPlan === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedPlan(option.id)}
              aria-pressed={active}
              className={`rounded-2xl border p-5 text-left ${
                active ? "border-primary bg-primary/5 shadow-sm" : "border-line bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-ink">{option.name}</h2>
                {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
              </div>
              <div className="mt-2">
                <span className="font-serif text-3xl font-bold text-ink">{option.price}</span>
                <span className="text-sm text-muted">{option.period}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{option.tagline}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-line bg-card p-6 lg:col-span-3">
          <h2 className="font-serif text-2xl text-ink">Demo checkout</h2>
          <div className="mt-4">
            <label htmlFor="payment-method" className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Payment method
            </label>
            <select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            >
              {PAYMENT_METHODS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 rounded-xl bg-canvas p-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>
                {plan.name} plan · {method}
              </span>
              <span className="font-semibold text-ink">{plan.price}</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              This is a demo. No charge, receipt or renewal will occur, and no entitlement is granted by a
              payment provider.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              activatePremium(selectedPlan);
              showToast("Demo checkout complete. Premium is active in this browser only.");
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Pay {plan.price} {plan.period} (demo)
          </button>

          <p className="mt-3 flex items-start gap-2 text-xs text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            Production grants entitlements only after a verified Paystack webhook, never from the frontend.
          </p>
        </section>

        <aside className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl text-ink">Premium includes</h2>
          <ul className="mt-4 space-y-2">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 text-ok" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Free plan keeps browsing, saved profiles, community rooms and all safety tools. Matching,
            interests and chat unlock with Premium.
          </p>
          <Link href="/membership" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Compare plans
          </Link>
        </aside>
      </div>
    </div>
  );
}
