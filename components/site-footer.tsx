import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-card">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-serif text-2xl font-bold text-primary">Covenant</div>
          <p className="mt-2 text-sm text-muted">
            Intentional courtship for Nigerian Christians. Verified members, faith-aligned matching,
            safety first.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/discover" className="hover:text-ink">
                Discover
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-ink">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/membership" className="hover:text-ink">
                Membership &amp; pricing
              </Link>
            </li>
            <li>
              <Link href="/preferences" className="hover:text-ink">
                Matching preferences
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Community</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/about" className="hover:text-ink">
                About Covenant
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-ink">
                Community rooms
              </Link>
            </li>
            <li>
              <Link href="/community-guidelines" className="hover:text-ink">
                Community guidelines
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-ink">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Legal &amp; support</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/safety" className="hover:text-ink">
                Safety &amp; verification
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink">
                Terms of service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-ink">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink">
                Contact &amp; support
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © 2026 Covenant. Built with faith, safety and respect in Nigeria. This is a product demo; no real
        accounts, identity checks or payments are processed.
      </div>
    </footer>
  );
}
