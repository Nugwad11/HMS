"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, ShieldOff } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { CHAT_OPENERS, PROFILES, REPORT_REASONS } from "@/lib/data";
import { canMessage } from "@/lib/domain";
import { isEmailVerified } from "@/lib/safety";
import { VerificationBadge } from "@/components/badges";
import type { ChatMessage } from "@/lib/types";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-10" aria-hidden>
          <div className="h-4 w-24 rounded-full bg-line" />
          <div className="mt-3 h-8 w-52 rounded-lg bg-line" />
          <div className="mt-6 h-[55vh] min-h-80 rounded-2xl border border-line bg-card" />
        </div>
      }
    >
      <Chat params={params} />
    </Suspense>
  );
}

function Chat({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = use(params);
  const router = useRouter();
  const { state, sendMessage, reportProfile, blockProfile, showToast } = useCovenant();
  const [draft, setDraft] = useState("");
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const profile = PROFILES.find((candidate) => candidate.id === profileId);
  const messages: ChatMessage[] = state.chat[profileId] ?? [];
  const isMatch = state.matches.includes(profileId);
  const member = state.member;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink">Chat not found</h1>
        <Link href="/matches" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Back to matches
        </Link>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink">Private messages</h1>
        <p className="mt-3 text-muted">Sign in to open your private conversations.</p>
        <Link href="/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);

  if (!isMatch) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink">Chat is not open yet</h1>
        <p className="mt-3 text-muted">
          Private chat opens only when interest is mutual. Express interest in {profile.firstName} from Discover.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/matches" className="rounded-full border border-line px-6 py-3 font-semibold text-ink">
            Back to matches
          </Link>
          <Link href="/discover" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Discover
          </Link>
        </div>
      </div>
    );
  }

  if (!state.premium) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink">This match is locked</h1>
        <p className="mt-3 text-muted">
          Matching and private chat are part of Covenant Premium. Subscribe to open your conversation with{" "}
          {profile.firstName}; nothing in your history is lost.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/matches" className="rounded-full border border-line px-6 py-3 font-semibold text-ink">
            Back to matches
          </Link>
          <Link href="/subscription" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Choose a plan
          </Link>
        </div>
      </div>
    );
  }

  if (!emailVerified) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink">Verify your email to chat</h1>
        <p className="mt-3 text-muted">
          A verified email is required for private messaging and for safety notices about your account.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/matches" className="rounded-full border border-line px-6 py-3 font-semibold text-ink">
            Back to matches
          </Link>
          <Link href="/profile" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Verify my email
          </Link>
        </div>
      </div>
    );
  }

  if (!canMessage({ isMatch, verification: state.verification, emailVerified, premium: state.premium })) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink">Chat is locked</h1>
        <p className="mt-3 text-muted">
          Photo verification is required before matched members can exchange messages.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/matches" className="rounded-full border border-line px-6 py-3 font-semibold text-ink">
            Back to matches
          </Link>
          <Link href="/verify" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Verify my photo
          </Link>
        </div>
      </div>
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const findings = sendMessage(profileId, text);
    if (findings.length > 0) {
      showToast("Message sent. Safety review flagged this content for moderation.");
    }
    setDraft("");
    inputRef.current?.focus();
  };

  const onBlock = () => {
    blockProfile(profileId);
    showToast(`You blocked ${profile.firstName}.`);
    router.push("/matches");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to matches
          </Link>
          <h1 className="mt-1 font-serif text-3xl text-ink">
            {profile.firstName}, {profile.age}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <VerificationBadge level={profile.verified} />
            {profile.city} · {profile.denomination} · {profile.attendance}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="report-reason" className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Report
            </label>
            <select
              id="report-reason"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              className="mt-1 rounded-lg border border-line bg-canvas px-2 py-1.5 text-xs text-ink"
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              reportProfile(profile.id, reportReason);
              showToast("Report sent. High-risk reports are reviewed within 4 hours.");
            }}
            className="rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-ink"
          >
            Submit report
          </button>
          <button
            type="button"
            onClick={onBlock}
            className="inline-flex items-center gap-1.5 rounded-full border border-bad/40 bg-card px-4 py-2 text-xs font-semibold text-bad"
          >
            <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
            Block
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs text-ink">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        <span>
          Keep the conversation here for now. Never send money, airtime, gift cards, bank details or
          personal contact details early. Photo sharing stays disabled for the first 48 hours of a match.
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card">
        <div className="flex h-[55vh] min-h-80 flex-col gap-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted">
              Say hello. Try asking about their favourite verse or what a good Sunday looks like.
            </p>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`max-w-[82%] ${message.fromMe ? "ml-auto" : ""}`}>
              {!message.fromMe && message.author && (
                <p className="mb-0.5 text-xs font-semibold text-muted">{message.author}</p>
              )}
              <div
                className={`rounded-2xl px-4 py-2 text-sm ${
                  message.fromMe ? "bg-primary text-primary-foreground" : "bg-canvas text-ink"
                }`}
              >
                {message.text}
              </div>
              <p className={`mt-0.5 text-[10px] text-muted ${message.fromMe ? "text-right" : ""}`}>
                {new Date(message.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              {message.flagged && (
                <div className="mt-1 rounded-lg border border-gold/40 bg-gold/10 p-2 text-xs text-ink">
                  {message.flagNotes && message.flagNotes.length > 0
                    ? `Safety review: ${message.flagNotes.join("; ")}. ${
                        message.fromMe
                          ? "This may breach the covenant and can flag your account."
                          : "Stay on Covenant and report anything suspicious."
                      }`
                    : "Safety notice: this message mentions money, contact details or an external link. Scammers push members off-platform or ask for money. Stay on Covenant and report anything suspicious."}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-line p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {CHAT_OPENERS.slice(0, 3).map((opener) => (
              <button
                key={opener}
                type="button"
                onClick={() => {
                  setDraft(opener);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-ink"
              >
                {opener.length > 42 ? `${opener.slice(0, 42)}…` : opener}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label htmlFor="message-input" className="sr-only">
              Write a message
            </label>
            <input
              id="message-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              placeholder="Write a message"
              className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={send}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
