import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Covenant terms of service: covenant acceptance, age limits, acceptable use and liability.",
};

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">Terms of service</h1>
      <p className="mt-3 text-muted">Draft terms for the Covenant platform. These are living documents and require legal review before launch.</p>
      <div className="mt-8 space-y-4 text-muted">
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Accepting the covenant</h2>
          <p className="mt-1">Members accept the Community Covenant, Terms and Privacy Policy before creating a profile.</p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Acceptable use</h2>
          <p className="mt-1">No solicitation, explicit content, harassment or attempts to bypass verification, limits or safety controls.</p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Limitation of liability</h2>
          <p className="mt-1">The platform facilitates respectful dating; it is not a party to agreements between members.</p>
        </section>
      </div>
    </div>
  );
}
