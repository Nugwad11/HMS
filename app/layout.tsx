import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CovenantProvider } from "@/lib/auth-store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  applicationName: "Covenant",
  title: {
    default: "Covenant — Intentional Courtship for Nigerian Christians",
    template: "%s | Covenant",
  },
  description:
    "Covenant is a faith-first dating platform for Nigerian Christians who want intentional courtship leading to marriage.",
  appleWebApp: {
    capable: true,
    title: "Covenant",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "Covenant",
    title: "Covenant — Intentional Courtship for Nigerian Christians",
    description:
      "Faith-first dating for Nigerian Christians: verified profiles, shared values and intentional courtship.",
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#14161b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG">
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink antialiased">
        <CovenantProvider>
          <Suspense fallback={<div className="h-[104px] border-b border-line bg-card" aria-hidden />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CovenantProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
