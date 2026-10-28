import type { CovenantState } from "./auth-store";
import { PROFILES } from "./data";
import { isEmailVerified } from "./safety";
import { SAFETY_FLAG_LABELS } from "./types";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string;
  tone: "match" | "action" | "info";
}

export function incomingLikes(state: CovenantState) {
  return PROFILES.filter(
    (profile) =>
      profile.likesYou &&
      profile.gender !== state.member?.gender &&
      !state.interests.includes(profile.id) &&
      !state.passes.includes(profile.id) &&
      !state.blocks.includes(profile.id)
  );
}

export function buildNotifications(state: CovenantState): NotificationItem[] {
  const items: NotificationItem[] = [];
  const member = state.member;
  const emailVerified = member ? isEmailVerified(member.email, state.verifiedEmail) : false;

  for (const profileId of state.matches) {
    const profile = PROFILES.find((p) => p.id === profileId);
    if (!profile) continue;
    const messages = state.chat[profileId] ?? [];
    const last = messages[messages.length - 1];
    items.push({
      id: `match-${profileId}`,
      title: `You matched with ${profile.firstName}`,
      body: last
        ? `“${last.text}”`
        : emailVerified
          ? "Say hello with a thoughtful, faith-led message."
          : "Verify your email to unlock chatting.",
      href: `/matches/${profileId}`,
      tone: "match",
    });
  }

  if (member && !emailVerified) {
    items.push({
      id: "verify-email",
      title: "Verify your email",
      body: "Email is required for safety notices and must be verified before you can send interest, chat or check your ID.",
      href: "/profile",
      tone: "action",
    });
  }

  const openMemberFlags = state.flags.filter(
    (flag) => flag.subjectId === "member" && flag.status === "open"
  );
  if (openMemberFlags.length > 0) {
    items.push({
      id: "safety-flags",
      title: `${openMemberFlags.length} safety ${openMemberFlags.length === 1 ? "notice" : "notices"} under review`,
      body: `${openMemberFlags.map((flag) => SAFETY_FLAG_LABELS[flag.kind]).join(", ")}. See the details in your Safety Centre.`,
      href: "/safety",
      tone: "action",
    });
  }

  const likes = incomingLikes(state);
  if (likes.length > 0) {
    items.push({
      id: "incoming-likes",
      title: state.premium
        ? `${likes.length} ${likes.length === 1 ? "member has" : "members have"} expressed interest`
        : "Someone expressed interest in you",
      body: state.premium
        ? `${likes.map((p) => p.firstName).join(", ")} liked your profile. Open Discover to respond.`
        : "Upgrade to Premium to see who expressed interest, then respond from Discover.",
      href: state.premium ? "/discover#likes-you" : "/subscription",
      tone: "action",
    });
  }

  if (state.verification < 2) {
    items.push({
      id: "verify-photo",
      title: "Complete photo verification",
      body: "Photo verification unlocks messaging with your matches and posting in community rooms.",
      href: "/verify",
      tone: "action",
    });
  } else if (state.verification === 2) {
    items.push({
      id: "verify-id",
      title: "Add ID verification",
      body: "Add the Verified badge and priority visibility in Discover.",
      href: "/verify",
      tone: "info",
    });
  }

  if (!state.premium) {
    items.push({
      id: "premium",
      title: "Unlock matching and chat with Premium",
      body: "Express interest, open mutual matches and chat privately, plus 20 interests a day and advanced filters.",
      href: "/membership",
      tone: "info",
    });
  }

  items.push({
    id: "daily-matches",
    title: "Your curated matches are ready",
    body: "Fresh, faith-aligned profiles are waiting in Discover.",
    href: "/discover",
    tone: "info",
  });

  return items;
}
