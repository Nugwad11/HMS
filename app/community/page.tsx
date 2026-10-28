"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import { COMMUNITY_ROOMS } from "@/lib/data";
import { isEmailVerified } from "@/lib/safety";

export default function Community() {
  const { state, sendCommunityMessage, reportProfile, showToast } = useCovenant();
  const [roomId, setRoomId] = useState(COMMUNITY_ROOMS[0].id);
  const [draft, setDraft] = useState("");

  const room = COMMUNITY_ROOMS.find((candidate) => candidate.id === roomId) ?? COMMUNITY_ROOMS[0];
  const messages = state.chat[`room:${roomId}`] ?? [];

  if (!state.member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">Community rooms</h1>
        <p className="mt-3 text-muted">
          Fellowship, prayer requests and courtship Q&amp;A for verified members. Join Covenant to take part.
        </p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Join free
        </Link>
      </div>
    );
  }

  const locked = state.verification < 2;
  const emailVerified = isEmailVerified(state.member.email, state.verifiedEmail);
  const canPost = !locked && emailVerified;

  const send = () => {
    const text = draft.trim();
    if (!text || !canPost) return;
    const findings = sendCommunityMessage(room.id, text);
    if (findings.length > 0) {
      showToast(
        `Not posted: ${findings[0].summary.toLowerCase()}. This attempt was flagged for review.`
      );
      return;
    }
    setDraft("");
    showToast("Posted to the room.");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Community</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Community rooms</h1>
      <p className="mt-2 text-muted">
        Fellowship, prayer requests and courtship Q&amp;A — keep it kind and Christ-centred. No contacts,
        links or money requests.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {COMMUNITY_ROOMS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setRoomId(candidate.id)}
              aria-pressed={candidate.id === roomId}
              className={`w-full rounded-xl border p-4 text-left ${
                candidate.id === roomId ? "border-primary bg-card" : "border-line bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-serif text-lg text-ink">{candidate.name}</div>
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  {candidate.topic}
                </span>
              </div>
              <div className="text-sm text-muted">{candidate.description}</div>
            </button>
          ))}

          <div className="rounded-xl border border-line bg-card p-4 text-xs text-muted">
            <p className="font-semibold text-ink">Room rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Respect every member’s pace and faith journey.</li>
              <li>No solicitation, explicit content or pressure.</li>
              <li>Report anything that feels unsafe.</li>
            </ul>
            <Link href="/community-guidelines" className="mt-2 inline-block font-semibold text-primary underline-offset-4 hover:underline">
              Read the full covenant
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl text-ink">{room.name}</h2>
          <p className="mt-1 text-sm text-muted">{room.description}. Keep it kind and Christ-centred.</p>

          {locked && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>
                Photo verification is required to post.{" "}
                <Link href="/verify" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Verify now
                </Link>
              </span>
            </div>
          )}

          {!emailVerified && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>
                Verify your email before posting in rooms.{" "}
                <Link href="/profile" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Verify email
                </Link>
              </span>
            </div>
          )}

          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-canvas p-4">
            {messages.length === 0 && <p className="text-sm text-muted">No messages yet. Start the fellowship.</p>}
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[85%] ${message.fromMe ? "ml-auto" : ""}`}>
                {!message.fromMe && (
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted">{message.author ?? "Member"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        reportProfile(`room:${message.id}`, "Inappropriate content", message.author ?? "Community member");
                        showToast("Message reported to the Trust & Safety queue.");
                      }}
                      className="text-[10px] text-muted underline-offset-2 hover:text-bad hover:underline"
                    >
                      Report
                    </button>
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    message.fromMe ? "bg-primary text-primary-foreground" : "bg-card text-ink"
                  }`}
                >
                  {message.text}
                </div>
                {message.flagged && (
                  <div className="mt-1 rounded-lg border border-gold/40 bg-gold/10 p-2 text-xs text-ink">
                    Safety notice: this post mentions money, contacts or a link. Please keep fellowship safe.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <label htmlFor="room-input" className="sr-only">
              Write to the room
            </label>
            <input
              id="room-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              disabled={!canPost}
              placeholder={
                !emailVerified
                  ? "Verify your email to post"
                  : locked
                    ? "Verify your photo to post"
                    : "Write to the room"
              }
              className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm text-ink disabled:opacity-60"
            />
            <button
              type="button"
              onClick={send}
              disabled={!canPost}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
