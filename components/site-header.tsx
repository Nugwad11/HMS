"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { PremiumBadge } from "@/components/badges";
import { incomingLikes } from "@/lib/notifications";

const NAV_ITEMS = [
  { href: "/discover", label: "Discover" },
  { href: "/matches", label: "Matches" },
  { href: "/community", label: "Community" },
  { href: "/safety", label: "Safety" },
  { href: "/membership", label: "Premium" },
];

export function SiteHeader() {
  const { state } = useCovenant();
  const pathname = usePathname();
  const member = state.member;
  const likes = member ? incomingLikes(state).length : 0;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div role="note" className="border-b border-gold/25 bg-gold/10 px-4 py-1.5 text-center text-[11px] text-ink">
        Demo build — accounts and profiles are stored on this device&apos;s server; SMS, email delivery,
        identity checks and payments are simulated.
      </div>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
          Covenant
          <span className="hidden text-xs font-sans font-normal tracking-normal text-muted sm:inline">
            Intentional courtship
          </span>
        </Link>

        <nav className="order-3 flex w-full gap-1 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:flex-1 sm:justify-end sm:overflow-visible sm:pb-0">
          {(member ? [{ href: "/dashboard", label: "Dashboard" }, ...NAV_ITEMS] : NAV_ITEMS).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:bg-card hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {member ? (
            <>
              {state.premium && <span className="hidden sm:inline-flex"><PremiumBadge /></span>}
              <Link
                href="/notifications"
                aria-label={`Notifications${likes > 0 ? `, ${likes} new` : ""}`}
                className="relative rounded-full border border-line bg-card p-2 text-ink"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {likes > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">
                    {likes}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3 text-sm font-medium text-ink"
              >
                {member.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {(member.firstName || "C").charAt(0)}
                  </span>
                )}
                <span className="max-w-24 truncate">{member.firstName || "Profile"}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-ink hover:bg-card"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
