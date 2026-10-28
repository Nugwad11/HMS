"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, MessageCircle, RotateCcw } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { PROFILES } from "@/lib/data";
import { scoreProfile } from "@/lib/domain";
import { VerificationBadge } from "@/components/badges";
import { ProfileCard } from "@/components/profile-card";
import type { Profile } from "@/lib/types";

type Tab = "matches" | "interests" | "saved" | "passed";

export default function Matches() {
  const { state, undoPass, showToast } = useCovenant();
  const [tab, setTab] = useState<Tab>("matches");
  const member = state.member;

  const resolve = (ids: string[]): Profile[] =>
    ids
      .filter((id) => !state.blocks.includes(id))
      .map((id) => PROFILES.find((profile) => profile.id === id))
      .filter((profile): profile is Profile => Boolean(profile));

  const matches = resolve(state.matches);
  const interestOnly = resolve(state.interests.filter((id) => !state.matches.includes(id)));
  const saved = resolve(state.saves);
  const passed = resolve(state.passes);

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Matches &amp; interests</h1>
        <p className="mt-3 text-muted">Sign in to see your matches, the interests you have sent and your saved profiles.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className="rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Join free
          </Link>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "matches", label: "Matches", count: matches.length },
    { id: "interests", label: "Interests sent", count: interestOnly.length },
    { id: "saved", label: "Saved", count: saved.length },
    { id: "passed", label: "Passed", count: passed.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Matches</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Matches &amp; interests</h1>
      <p className="mt-2 text-muted">Mutual interest opens a private conversation. Everything else waits for you here.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "border border-line bg-card text-ink"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {tab === "matches" && !state.premium && (
        <section className="mt-6 rounded-2xl border border-gold/40 bg-gold/5 p-8 text-center">
          <Lock className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
          <h2 className="mt-3 font-serif text-2xl text-ink">Subscribe to open your matches</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">
            Expressing interest, mutual matches and private chat are part of Premium. Your matches and
            conversations stay here, waiting, until you subscribe.
          </p>
          <Link
            href="/subscription"
            className="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground"
          >
            See plans
          </Link>
          <p className="mt-3 text-xs text-muted">Demo checkout only — no payment is taken in this build.</p>
        </section>
      )}

      {tab === "matches" && state.premium && (
        <section className="mt-6">
          {matches.length === 0 ? (
            <EmptyState
              title="No matches yet"
              body="Express interest in a few profiles. When interest is mutual, a chat opens here."
            />
          ) : (
            <>
              {state.verification < 2 && (
                <div className="mb-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink">
                  Photo verification is required before you can send messages.{" "}
                  <Link href="/verify" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Verify now
                  </Link>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((profile) => {
                  const messages = state.chat[profile.id] ?? [];
                  const last = messages[messages.length - 1];
                  const { score } = scoreProfile(profile, member, state.preferences);
                  return (
                    <div key={profile.id} className="flex flex-col rounded-2xl border border-line bg-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-serif text-lg font-bold text-primary-foreground">
                            {profile.firstName.charAt(0)}
                          </span>
                          <div>
                            <h2 className="font-serif text-xl text-ink">
                              {profile.firstName}, {profile.age}
                            </h2>
                            <div className="text-sm text-muted">
                              {profile.city} · {profile.denomination}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-serif text-xl font-bold text-gold">{score}%</div>
                          <VerificationBadge level={profile.verified} />
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 rounded-lg bg-canvas p-3 text-sm text-muted">
                        {last ? `${last.fromMe ? "You: " : ""}${last.text}` : "No messages yet — open the chat and say hello."}
                      </p>
                      <Link
                        href={`/matches/${profile.id}`}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        Open chat
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {tab === "interests" && (
        <section className="mt-6">
          {interestOnly.length === 0 ? (
            <EmptyState
              title="No interests awaiting a reply"
              body="Interests you send show here until the other member responds."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {interestOnly.map((profile) => {
                const { score } = scoreProfile(profile, member, state.preferences);
                const note = state.interestNotes[profile.id];
                return (
                  <div key={profile.id} className="rounded-2xl border border-line bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-serif text-xl text-ink">
                          {profile.firstName}, {profile.age}
                        </h2>
                        <div className="text-sm text-muted">
                          {profile.city} · {profile.denomination} · {profile.attendance}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xl font-bold text-gold">{score}%</div>
                        <VerificationBadge level={profile.verified} />
                      </div>
                    </div>
                    {note ? (
                      <p className="mt-3 rounded-lg bg-canvas p-3 text-sm text-ink">
                        <span className="font-semibold">Your note: </span>
                        {note}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold">
                      Awaiting mutual interest
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "saved" && (
        <section className="mt-6">
          {saved.length === 0 ? (
            <EmptyState title="Nothing saved yet" body="Save profiles you want to revisit. They stay out of the daily list." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {saved.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "passed" && (
        <section className="mt-6">
          {passed.length === 0 ? (
            <EmptyState title="No profiles passed" body="Profiles you pass on are removed from Discover until you undo it." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {passed.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-4">
                  <div>
                    <div className="font-semibold text-ink">
                      {profile.firstName}, {profile.age}
                    </div>
                    <div className="text-sm text-muted">
                      {profile.city} · {profile.denomination}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      undoPass(profile.id);
                      showToast(`${profile.firstName} is back in Discover.`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Undo pass
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-8 text-center">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
      <Link href="/discover" className="mt-6 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
        Go to Discover
      </Link>
    </div>
  );
}
