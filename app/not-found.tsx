import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HeartHandshake className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 font-serif text-4xl text-ink">This page is not part of the covenant</h1>
      <p className="mt-3 text-muted">
        The link may be broken, or the page may have moved. Return to the home page or head back to
        your dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Back home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:bg-card"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
