"use client";

import { useState } from "react";
import Link from "next/link";
import { useCovenant } from "@/lib/auth-store";

export default function Login() {
  const { state, sessionReady, signIn, signOut, showToast } = useCovenant();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const member = state.member;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? "Could not sign you in. Try again.");
      setPassword("");
      return;
    }
    setPassword("");
    showToast("Signed in. Welcome back.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sign in</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Welcome back</h1>

      {!sessionReady ? (
        <p className="mt-6 text-sm text-muted">Checking your session…</p>
      ) : member ? (
        <div className="mt-6 rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-3">
            {member.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-serif text-xl font-bold text-primary-foreground">
                {(member.firstName || "C").charAt(0)}
              </span>
            )}
            <div>
              <div className="font-semibold text-ink">{member.firstName || "Covenant member"}</div>
              <div className="text-sm text-muted">
                {member.city} · {member.denomination}
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="mt-5 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Continue to dashboard
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              showToast("Signed out on this device.");
            }}
            className="mt-3 block w-full rounded-full border border-line px-6 py-3 text-center text-sm font-semibold text-ink"
          >
            Sign out
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-serif text-xl text-ink">Sign in to your account</h2>
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="em">
            Email address
          </label>
          <input
            id="em"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
          />
          {error && <p className="mt-2 text-sm text-bad">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-3 text-center text-sm text-muted">
            New to Covenant?{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      )}

      <p className="mt-4 text-xs text-muted">
        Accounts are stored on this device&apos;s server with hashed passwords and server sessions. SMS,
        ID checks and payments remain simulated in this demo.
      </p>
    </div>
  );
}
