import { ShieldCheck, Sparkles } from "lucide-react";
import { VERIFICATION_LABELS, VERIFICATION_STEPS } from "@/lib/types";
import type { VerificationLevel } from "@/lib/types";

export function VerificationBadge({ level }: { level: VerificationLevel }) {
  const tone =
    level >= 2
      ? "border-ok/40 bg-ok/10 text-ok"
      : level === 1
        ? "border-line bg-canvas text-muted"
        : "border-line bg-canvas text-muted";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`}
    >
      {level >= 2 && <ShieldCheck className="h-3 w-3" aria-hidden="true" />}
      {VERIFICATION_LABELS[level]}
    </span>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      Premium
    </span>
  );
}

export function VerificationSteps() {
  return (
    <ol className="space-y-3">
      {VERIFICATION_STEPS.map((step) => (
        <li key={step.level} className="rounded-lg border border-line bg-canvas p-4">
          <div className="font-semibold text-ink">
            Tier {step.level}: {step.name}
          </div>
          <div className="mt-1 text-sm text-muted">Unlocks: {step.unlocks}</div>
        </li>
      ))}
    </ol>
  );
}
