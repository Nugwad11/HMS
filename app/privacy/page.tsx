import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Covenant privacy policy: NDPA 2023 alignment, consent, data minimisation, deletion and retention.",
};

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">Privacy policy</h1>
      <p className="mt-3 text-muted">Draft policy aligned to the Nigeria Data Protection Act 2023. Requires legal review before launch.</p>
      <div className="mt-8 space-y-4 text-muted">
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Sensitive data</h2>
          <p className="mt-1">Religious belief is treated as sensitive personal data and requires explicit consent with clear purpose statements.</p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Email and safety monitoring</h2>
          <p className="mt-1">
            Email is required and verified before interests, messaging or ID checks. Chat content is screened for
            financial requests, off-platform contact and contradictions with registration details. Flags are
            reviewed by a human, and notices go to the verified email. Production would document the legal basis,
            retention and appeal process for this monitoring.
          </p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Location</h2>
          <p className="mt-1">
            The “Use my current location” button asks your device for a one-off GPS position. This is the same
            Google location service most Android phones use. The coordinates are sent to Covenant only to work out
            your city or state, then discarded; only the city or state you keep is saved on your profile. Nothing
            is shared with other members beyond what your profile already shows, and location is never tracked in
            the background.
          </p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Identity documents</h2>
          <p className="mt-1">
            ID verification compares the document date of birth with the profile date of birth. The ID date of
            birth is not retained; only the outcome of the comparison is stored. The demo does not accept real
            documents.
          </p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Member rights</h2>
          <p className="mt-1">Members may access, correct, delete or port their data, subject to legal holds.</p>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Retention</h2>
          <p className="mt-1">Data is retained only as needed for the match relationship and limited safety investigations.</p>
        </section>
      </div>
    </div>
  );
}
