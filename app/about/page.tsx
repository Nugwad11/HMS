import type { Metadata } from "next";
import Link from "next/link";
import { Check, Church, HeartHandshake, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Covenant",
  description:
    "Covenant is a faith-first dating platform for Nigerian Christians seeking intentional courtship that leads to marriage.",
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    body: "No unverified member can message others. Verification is a foundation, not an upgrade.",
  },
  {
    icon: HeartHandshake,
    title: "Intentional by design",
    body: "Every member states their relationship intent, so expectations stay clear from the first hello.",
  },
  {
    icon: Church,
    title: "Faith as a first-class attribute",
    body: "Denomination, church life and courtship views carry real weight in compatibility.",
  },
  {
    icon: Users,
    title: "Respect and dignity",
    body: "Divorced and widowed members are welcomed without stigma. Privacy is the default.",
  },
];

const BELIEFS = [
  "Courtship is intentional dating with marriage in view.",
  "Family and church community matter, but no member is pressured to involve them early.",
  "Sensitive details — faith, location, employer, church — stay private until you choose otherwise.",
  "Safety tools, scam education and reporting are available to every member, free.",
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About</p>
      <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">About Covenant</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Covenant is a modern, secure dating platform for Nigerian Christian adults who want to meet
        compatible partners for intentional dating, courtship and marriage.
      </p>

      <section className="mt-10 rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-ink">Why Covenant exists</h2>
        <p className="mt-3 text-muted">
          General dating apps are dominated by casual dating. Intentions mismatch, romance scams and fake
          profiles are common, and faith is often reduced to a single checkbox. Busy professionals in Lagos,
          Abuja and Port Harcourt — and Nigerians in the diaspora — have little time for guesswork.
        </p>
        <p className="mt-3 text-muted">
          Covenant treats faith, family values and safety as first-class features. Members state their
          intent, verify their identity in tiers, and receive curated matches with a clear explanation of
          why they were matched.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-ink">Our principles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-2xl border border-line bg-card p-5">
              <principle.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-2 font-serif text-lg text-ink">{principle.title}</h3>
              <p className="mt-1 text-sm text-muted">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">What we believe about courtship</h2>
        <ul className="mt-4 space-y-2">
          {BELIEFS.map((belief) => (
            <li key={belief} className="flex items-start gap-2 text-sm text-ink">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
              {belief}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">Who it is for</h2>
          <p className="mt-2 text-sm text-muted">
            Christian adults aged 18 and older in Lagos, Abuja, Port Harcourt, Ibadan, Enugu, Benin City and
            Kaduna, plus Nigerian diaspora communities. All Christian denominations are welcome.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-2xl text-ink">What it is not</h2>
          <p className="mt-2 text-sm text-muted">
            Covenant is not a church community forum or a marriage-counselling service. It is a dating
            platform that respects Christian values, with optional community rooms and safety tools.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-2xl text-ink">Privacy and the NDPA 2023</h2>
        <p className="mt-2 text-sm text-muted">
          Religious belief is sensitive personal data. Covenant asks for explicit consent, minimises what it
          collects, hides sensitive details by default, and supports access, correction, portability and
          deletion. Production identity checks are handled by licensed providers and never exposed to other
          members.
        </p>
        <Link href="/privacy" className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Read the privacy policy →
        </Link>
      </section>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/signup" className="w-full rounded-full bg-primary px-8 py-3.5 text-center font-semibold text-primary-foreground sm:w-auto">
          Join Covenant free
        </Link>
        <Link href="/how-it-works" className="w-full rounded-full border border-line bg-card px-8 py-3.5 text-center font-semibold text-ink sm:w-auto">
          How it works
        </Link>
      </div>
    </div>
  );
}
