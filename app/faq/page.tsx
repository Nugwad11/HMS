import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Covenant: verification, intentions, safety, pricing and more.",
};

const QA = [
  { q: "Do I need to be a Christian to join?", a: "Members are asked to describe their faith openly. The platform is built for Nigerian Christian adults seeking compatible partners for intentional dating, courtship or marriage." },
  { q: "Is Covenant a church community forum?", a: "No. Covenant is a dating platform that respects Christian values. It is not a church forum or a marriage-counselling service, though community rooms and optional pastoral endorsement features exist." },
  { q: "What is the age limit?", a: "Members must be 18 or older. Those under 18 are blocked and their data is not retained." },
  { q: "How does verification work?", a: "Tier 1: phone OTP. Tier 2: live photo verification. Tier 3: ID via a licensed provider, with the date of birth cross-checked against your profile. Tier 4: pastoral or friend endorsement (coming soon)." },
  { q: "Why is an email address required?", a: "Email is required and must be verified before you can send interest, chat or run an ID check. It is the address that receives safety flags, including a date-of-birth mismatch between your profile and your ID." },
  { q: "Are my chats monitored?", a: "Messages are checked by rules for financial requests, attempts to move the conversation off Covenant, and claims that contradict your registration (age, city, denomination). A moderator reviews every flag; this demo uses a transparent rule-based scanner, not automated punishment." },
  { q: "How does Covenant know my location?", a: "Use the “Use my current location” button next to the city or state field. Your phone shares a one-off GPS position through the same Google location service it uses for maps, and Covenant converts it to a Nigerian city or state. Coordinates are not stored and nothing is tracked in the background; you can always pick your location manually instead." },
  { q: "When can I message?", a: "Matching and messaging require an active Premium subscription, photo verification (Tier 2) and a verified email. ID verification (Tier 3) adds the “Verified” badge and priority visibility." },
  { q: "Can I match on the free plan?", a: "No. Free members can browse, filter, save profiles and use community rooms and safety tools. Expressing interest, mutual matches and private chat require Premium; your matches and chat history stay saved if you cancel." },
  { q: "What are the scam red flags?", a: "Requests for money, airtime or gift cards; pushing to WhatsApp or external apps quickly; refusing to meet or video-call; professing love within days. Use the safety tools to report and block." },
  { q: "How much does Premium cost?", a: "₦500/month, ₦1,200/quarterly or ₦5,000/year. Matching requires an active subscription; Premium also includes up to twenty expressions of interest a day, advanced filters, a weekly boost and read receipts." },
  { q: "Is this the live product?", a: "This build is a fully interactive demo. Profiles, verification, payments and the admin console are simulated in your browser and stored only on this device. Production would replace them with verified users, Paystack/Flutterwave payments, licensed ID checks and server-side entitlements." },
];

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-ink">Frequently asked questions</h1>
      <div className="mt-8 space-y-4">
        {QA.map((item) => (
          <details key={item.q} className="rounded-xl border border-line bg-card p-5">
            <summary className="cursor-pointer font-serif text-lg text-ink">{item.q}</summary>
            <p className="mt-3 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
