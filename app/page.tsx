import Link from "next/link";
import { ShieldCheck, HeartHandshake, Church, ShieldAlert, Check, Lock, Sparkles } from "lucide-react";
import { FREE_FEATURES, PREMIUM_FEATURES, PREMIUM_PLANS } from "@/lib/data";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified identities",
    body: "Phone, photo and ID verification help keep romance scams and fake profiles out of the community.",
  },
  {
    icon: HeartHandshake,
    title: "Intentional by design",
    body: "Every member states their relationship intent — courting toward marriage — so expectations stay clear.",
  },
  {
    icon: Church,
    title: "Faith-aligned matching",
    body: "Denomination, church attendance and values sit at the centre of compatibility, not as an afterthought.",
  },
  {
    icon: ShieldAlert,
    title: "Safety first",
    body: "Scam warnings, reporting, blocking and first-date guidance keep members protected while dating.",
  },
];

const STEPS = [
  {
    title: "Join & verify",
    body: "Create your profile, accept the community covenant and complete phone, photo or ID verification.",
  },
  {
    title: "Build your story",
    body: "Share your faith, values, lifestyle and the verse that anchors you — without oversharing.",
  },
  {
    title: "Discover curated matches",
    body: "Get daily curated Christian singles in your city, ranked by compatibility with a clear “why”.",
  },
  {
    title: "Chat & build",
    body: "When interest is mutual, Premium members open a private chat. Keep it safe, keep it respectful, keep it faith-led.",
  },
];

const SAFETY_POINTS = [
  "Photo verification required before messaging",
  "Scam and money-request warnings inside chat",
  "One-tap report and block on every profile",
  "First-date guidance and a share-my-date helper",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 text-center sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Faith-first · Verified members</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Find a partner who shares your faith.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Covenant is a dating platform for Nigerian Christians who want intentional courtship that leads to
          marriage. Members are verified, intentions are explicit, and faith is never an afterthought.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-full bg-primary px-8 py-3.5 text-center font-semibold text-primary-foreground sm:w-auto"
          >
            Join free
          </Link>
          <Link
            href="/discover"
            className="w-full rounded-full border border-line bg-card px-8 py-3.5 text-center font-semibold text-ink sm:w-auto"
          >
            Discover
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> Tiered verification
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> Privacy by default
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> Naira-friendly plans
          </span>
        </div>
      </section>

      <section className="grid gap-4 pb-14 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-xl border border-line bg-card p-5">
            <value.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-lg text-ink">{value.title}</h2>
            <p className="mt-2 text-sm text-muted">{value.body}</p>
          </div>
        ))}
      </section>

      <section className="pb-14">
        <h2 className="font-serif text-3xl text-ink">How Covenant works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-card p-5">
              <div className="font-serif text-3xl font-bold text-gold">{index + 1}</div>
              <h3 className="mt-2 font-serif text-lg text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 text-center">
          <Link href="/how-it-works" className="font-medium text-primary underline-offset-4 hover:underline">
            Read the full journey →
          </Link>
        </div>
      </section>

      <section className="grid items-center gap-6 rounded-2xl border border-line bg-card p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Safety &amp; trust</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Built for real trust, not guesswork</h2>
          <p className="mt-3 text-muted">
            Romance scams and fake profiles are common on general dating apps. Covenant is designed around
            verification, privacy and clear boundaries, with guidance for meeting in person.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/safety" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
              Safety centre
            </Link>
            <Link href="/community-guidelines" className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink">
              Community covenant
            </Link>
          </div>
        </div>
        <ul className="space-y-3">
          {SAFETY_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2 rounded-xl bg-canvas p-3 text-sm text-ink">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="py-14">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Membership</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Start free. Upgrade when you are ready.</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted">
            Free membership lets you browse verified Christian singles and join the community. Premium
            unlocks matching, private chat and better filters.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="font-serif text-xl text-ink">Free</h3>
            <div className="mt-2 font-serif text-3xl font-bold text-ink">₦0</div>
            <p className="text-xs text-muted">Always available</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {FREE_FEATURES.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-5 block rounded-full border border-line py-2.5 text-center text-sm font-semibold text-ink">
              Join free
            </Link>
          </div>

          {PREMIUM_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-card p-5 ${
                plan.id === "annual" ? "border-primary shadow-sm" : "border-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-ink">{plan.name}</h3>
                {plan.id === "annual" && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Best value
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="font-serif text-3xl font-bold text-ink">{plan.price}</span>
                <span className="text-xs text-muted">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{plan.tagline}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {PREMIUM_FEATURES.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/subscription"
                className={`mt-5 block rounded-full py-2.5 text-center text-sm font-semibold ${
                  plan.id === "annual"
                    ? "bg-primary text-primary-foreground"
                    : "border border-line text-ink"
                }`}
              >
                Go Premium
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Demo pricing from the product brief. No payment is taken. See{" "}
          <Link href="/membership" className="font-medium text-primary underline-offset-4 hover:underline">
            full membership details
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
        <h2 className="font-serif text-3xl">Ready to begin intentional courtship?</h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
          Join a community that treats faith, family and marriage with the seriousness they deserve.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="rounded-full bg-primary-foreground px-8 py-3.5 font-semibold text-primary">
            Create free account
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-primary-foreground/40 px-8 py-3.5 font-semibold text-primary-foreground"
          >
            How it works
          </Link>
        </div>
      </section>
    </div>
  );
}
