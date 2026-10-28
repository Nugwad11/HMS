import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "Covenant community covenant: dignity, honesty, no solicitation, no explicit content, respect for pace and faith journey.",
};

const PRINCIPLES = [
  "Be honest about who you are and what you want.",
  "Treat every member with dignity and respect.",
  "No solicitation of money, gifts or financial favours.",
  "No sexually explicit content or pressure.",
  "Respect another person’s “no”, their pace and their faith journey.",
  "Report abuse so the community stays safe.",
];

export default function CommunityGuidelines() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">Community Covenant</h1>
      <p className="mt-3 text-muted">
        Covenant exists so that faith-led courtship can happen without romance scams, disrespect or spiritual
        harm. The draft covenant principles are:
      </p>
      <ul className="mt-6 space-y-3">
        {PRINCIPLES.map((p) => (
          <li key={p} className="rounded-xl border border-line bg-card p-5 text-ink">
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Reporting is always welcome and reviewed by the Trust &amp; Safety team. High-risk reports are reviewed
        within four hours; standard reports within 24 hours.
      </p>
    </div>
  );
}
