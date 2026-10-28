import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Covenant support: in-app help, WhatsApp support channel and customer care contacts.",
};

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">Contact &amp; support</h1>
      <p className="mt-3 text-muted">We’re here to help members, matches and anyone with safety concerns.</p>
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">In-app support</h2>
          <p className="mt-1 text-muted">Open the Safety Centre or use the help section in the app to raise a ticket.</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">WhatsApp support</h2>
          <p className="mt-1 text-muted">Join the WhatsApp community channel for updates and quick help.</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-serif text-xl text-ink">Safety emergencies</h2>
          <p className="mt-1 text-muted">If you are in immediate danger, contact local authorities or a trusted person first.</p>
        </div>
      </div>
    </div>
  );
}
