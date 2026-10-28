import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How Covenant guides members from join, to verification, to curated discovery, to safe chat.",
};

const STEPS = [
  {
    title: "1. Join & verify",
    body: "Sign up with a Nigerian mobile number, accept the community covenant, and complete the guided profile. Members move through phone, photo and ID verification.",
  },
  {
    title: "2. Build your profile",
    body: "Share your faith, values, lifestyle and relationship intentions. Faith details are optional and visible only to matches unless you hide them.",
  },
  {
    title: "3. Discover curated matches",
    body: "Receive daily curated Christian singles in your city, ranked by compatibility, with an explanation of why you were matched.",
  },
  {
    title: "4. Express interest",
    body: "Premium members send an interest with an optional short note. Passes and saves keep your preferences respected. Mutual interest opens chat.",
  },
  {
    title: "5. Chat safely",
    body: "Matched Premium members message privately. Photo sharing unlocks after verification; scam-related language triggers safety warnings.",
  },
  {
    title: "6. Courtship onward",
    body: "Premium also adds more daily interests, advanced filters and weekly boosts. Safety tools and community rooms support the relationship.",
  },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">How Covenant works</h1>
      <p className="mt-3 text-muted">
        From a stranger with faith questions to a relationship that leads to marriage — the platform stays
        focused on intentional, safe, faith-aligned courtship.
      </p>
      <div className="mt-10 space-y-6">
        {STEPS.map((s) => (
          <section key={s.title} className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-serif text-2xl text-ink">{s.title}</h2>
            <p className="mt-2 text-muted">{s.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/signup" className="rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Start your journey
        </Link>
      </div>
    </div>
  );
}
