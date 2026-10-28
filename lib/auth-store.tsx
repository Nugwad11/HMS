"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  ChatMessage,
  DemoEmail,
  IdCheck,
  MemberProfile,
  NotificationSettings,
  Preferences,
  Report,
  SafetyFlag,
  VerificationLevel,
} from "./types";
import { SAFETY_FLAG_LABELS } from "./types";
import {
  ADMIN_ACCESS_CODE,
  CHAT_OPENERS,
  COMMUNITY_SEED,
  DEFAULT_MEMBER,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PREFERENCES,
  PROFILES,
} from "./data";
import { canMessage, countDailyInterests, remainingDailyInterests, toggleSaved } from "./domain";
import {
  dobMatches,
  formatDob,
  isEmailVerified,
  scanMessage,
  type SafetyFinding,
} from "./safety";
import { authApi, ApiError } from "./api-client";

const LEGACY_STORAGE_KEY = "covenant-demo-v3";
const STORAGE_PREFIX = "covenant-demo-v4:";

export type InterestResult = "sent" | "matched" | "limit" | "email-unverified" | "subscription-required" | "unavailable";
export type IdCheckOutcome = "match" | "mismatch" | "unavailable";

export interface CovenantState {
  accountId: string | null;
  member: MemberProfile | null;
  onboarded: boolean;
  verification: VerificationLevel;
  verifiedEmail: string | null;
  emailCode: { email: string; code: string; sentAt: number } | null;
  flags: SafetyFlag[];
  outbox: DemoEmail[];
  lastIdCheck: IdCheck | null;
  premium: boolean;
  premiumPlan: string | null;
  premiumSince: number | null;
  interests: string[];
  interestLog: number[];
  interestNotes: Record<string, string>;
  passes: string[];
  saves: string[];
  matches: string[];
  chat: Record<string, ChatMessage[]>;
  reports: Report[];
  blocks: string[];
  preferences: Preferences;
  notifications: NotificationSettings;
  adminUnlocked: boolean;
  auditLog: string[];
  verificationDecisions: Record<string, "approved" | "rejected">;
}

interface Toast {
  id: number;
  message: string;
}

interface CovenantContextValue {
  state: CovenantState;
  sessionReady: boolean;
  toast: Toast | null;
  showToast: (message: string) => void;
  registerAccount: (input: {
    email: string;
    password: string;
    phone: string;
    profile: MemberProfile;
  }) => Promise<{ ok: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<{ ok: boolean; message?: string }>;
  requestEmailCode: () => Promise<{ ok: boolean; demoCode: string | null; message?: string }>;
  confirmEmailCode: (code: string) => Promise<{ ok: boolean; message?: string }>;
  updateMember: (member: MemberProfile) => void;
  sendInterest: (profileId: string, note?: string) => InterestResult;
  passProfile: (profileId: string) => void;
  undoPass: (profileId: string) => void;
  saveProfile: (profileId: string) => void;
  reportProfile: (profileId: string, reason: string, profileName?: string) => void;
  blockProfile: (profileId: string) => void;
  unblockProfile: (profileId: string) => void;
  startChat: (profileId: string) => void;
  sendMessage: (profileId: string, text: string) => SafetyFinding[];
  sendCommunityMessage: (roomId: string, text: string) => SafetyFinding[];
  setMemberPhoto: (photo: string | null) => void;
  verifyPhone: () => void;
  verifyPhoto: () => void;
  submitIdCheck: (idDob: string) => IdCheckOutcome;
  activatePremium: (planId: string) => void;
  cancelPremium: () => void;
  updatePreferences: (preferences: Preferences) => void;
  updateNotifications: (settings: NotificationSettings) => void;
  unlockAdmin: (code: string) => boolean;
  resolveReport: (reportId: string, action: "Warn" | "Suspend" | "Dismiss") => void;
  resolveFlag: (flagId: string, action: "Uphold" | "Clear") => void;
  resolveVerification: (profileId: string, decision: "approved" | "rejected") => void;
  resetDemo: () => void;
}

const CovenantContext = createContext<CovenantContextValue | null>(null);

function createBaseState(): CovenantState {
  return {
    accountId: null,
    member: null,
    onboarded: false,
    verification: 0,
    verifiedEmail: null,
    emailCode: null,
    flags: [],
    outbox: [],
    lastIdCheck: null,
    premium: false,
    premiumPlan: null,
    premiumSince: null,
    interests: [],
    interestLog: [],
    interestNotes: {},
    passes: [],
    saves: [],
    matches: [],
    chat: Object.fromEntries(
      Object.entries(COMMUNITY_SEED).map(([roomId, messages]) => [roomId, [...messages]])
    ),
    reports: [],
    blocks: [],
    preferences: { ...DEFAULT_PREFERENCES },
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
    adminUnlocked: false,
    auditLog: [],
    verificationDecisions: {},
  };
}

function mergeStoredState(parsed: Partial<CovenantState>): CovenantState {
  const base = createBaseState();
  return {
    ...base,
    ...parsed,
    accountId: null,
    member: parsed.member ? { ...DEFAULT_MEMBER, ...parsed.member } : null,
    verifiedEmail: parsed.verifiedEmail ?? null,
    emailCode: parsed.emailCode ?? null,
    flags: parsed.flags ?? [],
    outbox: parsed.outbox ?? [],
    lastIdCheck: parsed.lastIdCheck ?? null,
    chat: { ...base.chat, ...(parsed.chat ?? {}) },
    preferences: { ...base.preferences, ...(parsed.preferences ?? {}) },
    notifications: { ...base.notifications, ...(parsed.notifications ?? {}) },
    interestNotes: parsed.interestNotes ?? {},
    verificationDecisions: parsed.verificationDecisions ?? {},
    auditLog: parsed.auditLog ?? [],
  };
}

/**
 * Account and profile data now live on the server. The browser keeps only the
 * simulated social state (matches, chat, local flags), bucketed per account.
 */
function loadAccountState(accountId: string): CovenantState {
  if (typeof window === "undefined") return createBaseState();
  try {
    const key = `${STORAGE_PREFIX}${accountId}`;
    const own = window.localStorage.getItem(key);
    if (own) return mergeStoredState(JSON.parse(own) as Partial<CovenantState>);

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      window.localStorage.setItem(key, legacy);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return mergeStoredState(JSON.parse(legacy) as Partial<CovenantState>);
    }
  } catch {
    return createBaseState();
  }
  return createBaseState();
}

function clearAccountState(accountId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${accountId}`);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

export function readLegacyDemoMember(): MemberProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { member?: MemberProfile | null };
    return parsed.member ? { ...DEFAULT_MEMBER, ...parsed.member } : null;
  } catch {
    return null;
  }
}

function apiMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

function makeEmail(
  to: string,
  subject: string,
  body: string,
  category: DemoEmail["category"]
): DemoEmail {
  return {
    id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    to,
    subject,
    body,
    at: Date.now(),
    category,
  };
}

function mergeFlags(
  existing: SafetyFlag[],
  findings: SafetyFinding[],
  subjectId: string,
  subjectName: string
): SafetyFlag[] {
  let next = existing;
  findings.forEach((finding, index) => {
    const duplicate = next.some(
      (flag) =>
        flag.subjectId === subjectId && flag.kind === finding.kind && flag.status === "open"
    );
    if (duplicate) return;
    const flag: SafetyFlag = {
      id: `flag-${Date.now()}-${index}`,
      kind: finding.kind,
      subjectId,
      subjectName,
      summary: finding.summary,
      evidence: finding.evidence,
      severity: finding.severity,
      status: "open",
      at: Date.now(),
      emailTo: null,
      emailSentAt: null,
    };
    next = [flag, ...next];
  });
  return next;
}

export function CovenantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CovenantState>(createBaseState);
  const [hydrated, setHydrated] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountIdRef = useRef<string | null>(null);
  const pendingSave = useRef<MemberProfile | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    const id = Date.now();
    setToast({ id, message });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await authApi.session();
        if (cancelled) return;
        if (session.user) {
          const local = loadAccountState(session.user.id);
          setState({
            ...local,
            accountId: session.user.id,
            member: session.profile,
            onboarded: session.profile !== null,
            verifiedEmail: session.user.emailVerified ? session.user.email : null,
            emailCode: null,
          });
        }
      } catch {
        // A failed lookup leaves the visitor signed out; public pages still work.
      } finally {
        if (!cancelled) {
          setHydrated(true);
          setSessionReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    accountIdRef.current = state.accountId;
  }, [state.accountId]);

  useEffect(() => {
    if (!hydrated || !state.accountId) return;
    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${state.accountId}`,
        JSON.stringify({ ...state, accountId: null })
      );
    } catch {
      // Storage unavailable or full; the demo keeps working in memory.
    }
  }, [state, hydrated]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const queueProfileSave = useCallback(
    (member: MemberProfile) => {
      saveChain.current = saveChain.current.then(async () => {
        try {
          await authApi.saveProfile(member);
        } catch (error) {
          showToast(apiMessage(error, "Could not save your profile. Check your connection."));
        }
      });
    },
    [showToast]
  );

  const flushProfileSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const member = pendingSave.current;
    pendingSave.current = null;
    if (member) queueProfileSave(member);
  }, [queueProfileSave]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushProfileSave();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [flushProfileSave]);

  useEffect(() => () => flushProfileSave(), [flushProfileSave]);

  const registerAccount = useCallback(
    async (input: { email: string; password: string; phone: string; profile: MemberProfile }) => {
      try {
        const response = await authApi.signup({
          email: input.email.trim().toLowerCase(),
          password: input.password,
          phone: input.phone.trim() || null,
          profile: input.profile,
        });

        const local = loadAccountState(response.user.id);
        const mail = response.demoCode
          ? makeEmail(
              response.user.email,
              "Your Covenant verification code",
              `Welcome to Covenant, ${response.profile.firstName}.\n\nYour email verification code is ${response.demoCode}. It expires in 10 minutes. Verifying your email is required before you can express interest, chat or submit an ID check.\n\nCovenant`,
              "verification"
            )
          : null;

        setState({
          ...local,
          accountId: response.user.id,
          member: response.profile,
          onboarded: true,
          // A new server account starts unverified and unpaid; inherited demo
          // social state must not carry trust or entitlement claims across.
          verification: 0,
          verifiedEmail: null,
          emailCode: response.demoCode
            ? { email: response.user.email, code: response.demoCode, sentAt: Date.now() }
            : null,
          lastIdCheck: null,
          premium: false,
          premiumPlan: null,
          premiumSince: null,
          outbox: mail ? [mail, ...local.outbox] : local.outbox,
          preferences: { ...local.preferences, denominationImportance: response.profile.denominationImportance },
        });

        return { ok: true };
      } catch (error) {
        return { ok: false, message: apiMessage(error, "Could not create your account. Try again.") };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email: email.trim().toLowerCase(), password });
      if (!response.user || !response.profile) {
        await authApi.logout().catch(() => undefined);
        return { ok: false, message: "That account has no profile yet. Create one to continue." };
      }

      const local = loadAccountState(response.user.id);
      setState({
        ...local,
        accountId: response.user.id,
        member: response.profile,
        onboarded: true,
        verifiedEmail: response.user.emailVerified ? response.user.email : null,
        emailCode: null,
        preferences: { ...local.preferences, denominationImportance: response.profile.denominationImportance },
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, message: apiMessage(error, "Could not sign you in. Try again.") };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    pendingSave.current = null;

    try {
      await authApi.logout();
    } catch {
      // Clear the browser state regardless; the server session expires on its own.
    }
    setState(createBaseState());
  }, []);

  const deleteAccount = useCallback(
    async (password: string) => {
      try {
        await authApi.deleteAccount(password);
        if (state.accountId) clearAccountState(state.accountId);
        setState(createBaseState());
        return { ok: true };
      } catch (error) {
        return { ok: false, message: apiMessage(error, "Could not delete your account. Try again.") };
      }
    },
    [state.accountId]
  );

  const requestEmailCode = useCallback(async () => {
    if (!state.member) {
      return { ok: false, demoCode: null, message: "Sign in to verify your email." };
    }

    try {
      const response = await authApi.requestEmailCode();
      const email = state.member.email;
      const mail = response.demoCode
        ? makeEmail(
            email,
            "Your Covenant verification code",
            `Your Covenant verification code is ${response.demoCode}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
            "verification"
          )
        : null;

      setState((s) => ({
        ...s,
        emailCode: response.demoCode ? { email, code: response.demoCode, sentAt: Date.now() } : null,
        outbox: mail ? [mail, ...s.outbox] : s.outbox,
      }));

      return { ok: true, demoCode: response.demoCode };
    } catch (error) {
      return { ok: false, demoCode: null, message: apiMessage(error, "Could not send a verification code.") };
    }
  }, [state.member]);

  const confirmEmailCode = useCallback(async (code: string) => {
    try {
      const response = await authApi.verifyEmailCode(code);
      setState((s) => ({ ...s, verifiedEmail: response.user.email, emailCode: null }));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: apiMessage(error, "That code could not be verified.") };
    }
  }, []);

  const updateMember = useCallback(
    (member: MemberProfile) => {
      setState((s) => (s.member ? { ...s, member } : s));
      if (!accountIdRef.current) return;

      pendingSave.current = member;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveTimer.current = null;
        const pending = pendingSave.current;
        pendingSave.current = null;
        if (pending) queueProfileSave(pending);
      }, 700);
    },
    [queueProfileSave]
  );

  const sendInterest = useCallback(
    (profileId: string, note?: string): InterestResult => {
      const member = state.member;
      if (!member) return "unavailable";
      if (!state.premium) return "subscription-required";
      if (!isEmailVerified(member.email, state.verifiedEmail)) return "email-unverified";
      if (state.blocks.includes(profileId) || state.interests.includes(profileId)) {
        return "unavailable";
      }
      if (remainingDailyInterests(countDailyInterests(state.interestLog), state.premium) === 0) {
        return "limit";
      }

      const profile = PROFILES.find((candidate) => candidate.id === profileId);
      setState((s) => {
        if (
          !s.member ||
          !s.premium ||
          !isEmailVerified(s.member.email, s.verifiedEmail) ||
          s.blocks.includes(profileId) ||
          s.interests.includes(profileId) ||
          remainingDailyInterests(countDailyInterests(s.interestLog), s.premium) === 0
        ) {
          return s;
        }

        const now = Date.now();
        const next: CovenantState = {
          ...s,
          interests: [...s.interests, profileId],
          interestLog: [...s.interestLog, now],
          interestNotes:
            note && note.trim()
              ? { ...s.interestNotes, [profileId]: note.trim() }
              : s.interestNotes,
        };

        if (!profile?.likesYou) return next;

        const opener = CHAT_OPENERS[next.interests.length % CHAT_OPENERS.length];
        const welcome: ChatMessage = {
          id: `m${now}`,
          fromMe: false,
          author: profile.firstName,
          text: `Hi ${s.member?.firstName || "there"}! ${opener}`,
          at: now,
        };
        return {
          ...next,
          matches: [...next.matches, profileId],
          chat: { ...next.chat, [profileId]: [...(next.chat[profileId] ?? []), welcome] },
        };
      });

      return profile?.likesYou ? "matched" : "sent";
    },
    [state]
  );

  const passProfile = useCallback((profileId: string) => {
    setState((s) => {
      if (s.passes.includes(profileId) || s.interests.includes(profileId) || s.blocks.includes(profileId)) {
        return s;
      }
      return { ...s, passes: [...s.passes, profileId] };
    });
  }, []);

  const undoPass = useCallback((profileId: string) => {
    setState((s) => ({ ...s, passes: s.passes.filter((id) => id !== profileId) }));
  }, []);

  const saveProfile = useCallback((profileId: string) => {
    setState((s) => {
      if (s.blocks.includes(profileId)) return s;
      return { ...s, saves: toggleSaved(s.saves, profileId) };
    });
  }, []);

  const reportProfile = useCallback((profileId: string, reason: string, profileName?: string) => {
    setState((s) => {
      const profile = PROFILES.find((p) => p.id === profileId);
      const report: Report = {
        id: `report-${Date.now()}`,
        profileId,
        profileName: profile?.firstName ?? profileName ?? "Community member",
        reason,
        severity: /scam|money|harass|fake|inappropriate|underage/i.test(reason) ? "High" : "Standard",
        at: Date.now(),
      };
      return { ...s, reports: [report, ...s.reports] };
    });
  }, []);

  const blockProfile = useCallback((profileId: string) => {
    setState((s) => ({
      ...s,
      blocks: s.blocks.includes(profileId) ? s.blocks : [...s.blocks, profileId],
      interests: s.interests.filter((id) => id !== profileId),
      saves: s.saves.filter((id) => id !== profileId),
      passes: s.passes.filter((id) => id !== profileId),
      matches: s.matches.filter((id) => id !== profileId),
      chat: Object.fromEntries(Object.entries(s.chat).filter(([key]) => key !== profileId)),
    }));
  }, []);

  const unblockProfile = useCallback((profileId: string) => {
    setState((s) => ({ ...s, blocks: s.blocks.filter((id) => id !== profileId) }));
  }, []);

  const startChat = useCallback((profileId: string) => {
    setState((s) => {
      if (
        s.blocks.includes(profileId) ||
        !canMessage({
          isMatch: s.matches.includes(profileId),
          verification: s.verification,
          emailVerified: isEmailVerified(s.member?.email, s.verifiedEmail),
          premium: s.premium,
        })
      ) {
        return s;
      }
      return s.chat[profileId] ? s : { ...s, chat: { ...s.chat, [profileId]: [] } };
    });
  }, []);

  const sendMessage = useCallback(
    (profileId: string, text: string): SafetyFinding[] => {
      const member = state.member;
      if (!member) return [];
      const emailVerified = isEmailVerified(member.email, state.verifiedEmail);
      if (
        state.blocks.includes(profileId) ||
        !canMessage({
          isMatch: state.matches.includes(profileId),
          verification: state.verification,
          emailVerified,
          premium: state.premium,
        })
      ) {
        return [];
      }

      const findings = scanMessage(text, {
        age: member.age,
        city: member.city,
        denomination: member.denomination,
      });

      setState((s) => {
        const now = Date.now();
        const message: ChatMessage = {
          id: `m${now}`,
          fromMe: true,
          text: text.trim(),
          at: now,
          flagged: findings.length > 0,
          flagNotes: findings.map((finding) => finding.summary),
        };
        return {
          ...s,
          flags: mergeFlags(s.flags, findings, "member", s.member?.firstName || "You"),
          chat: { ...s.chat, [profileId]: [...(s.chat[profileId] ?? []), message] },
        };
      });

      return findings;
    },
    [state]
  );

  const sendCommunityMessage = useCallback(
    (roomId: string, text: string): SafetyFinding[] => {
      const member = state.member;
      if (!member) return [];
      if (state.verification < 2 || !isEmailVerified(member.email, state.verifiedEmail)) {
        return [];
      }

      const findings = scanMessage(text, {
        age: member.age,
        city: member.city,
        denomination: member.denomination,
      });

      setState((s) => {
        if (findings.length > 0) {
          return {
            ...s,
            flags: mergeFlags(s.flags, findings, "member", s.member?.firstName || "You"),
          };
        }
        const key = `room:${roomId}`;
        const message: ChatMessage = {
          id: `m${Date.now()}`,
          fromMe: true,
          author: s.member?.firstName || "You",
          text: text.trim(),
          at: Date.now(),
        };
        return { ...s, chat: { ...s.chat, [key]: [...(s.chat[key] ?? []), message] } };
      });

      return findings;
    },
    [state]
  );

  const setMemberPhoto = useCallback(
    (photo: string | null) => {
      if (!state.member) return;
      updateMember({ ...state.member, photo });
    },
    [state.member, updateMember]
  );

  const verifyPhone = useCallback(() => {
    setState((s) => ({ ...s, verification: Math.max(s.verification, 1) as VerificationLevel }));
  }, []);

  const verifyPhoto = useCallback(() => {
    setState((s) =>
      s.verification < 1
        ? s
        : { ...s, verification: Math.max(s.verification, 2) as VerificationLevel }
    );
  }, []);

  const submitIdCheck = useCallback(
    (idDob: string): IdCheckOutcome => {
      const member = state.member;
      if (!member || state.verification < 2 || !member.dateOfBirth) return "unavailable";
      if (!isEmailVerified(member.email, state.verifiedEmail)) return "unavailable";

      const matched = dobMatches(member.dateOfBirth, idDob);
      const check: IdCheck = { at: Date.now(), profileDob: member.dateOfBirth, matched };

      if (matched) {
        setState((s) => ({
          ...s,
          verification: Math.max(s.verification, 3) as VerificationLevel,
          lastIdCheck: check,
          auditLog: [
            `ID date-of-birth check passed: ${member.firstName || "Member"} (${new Date().toLocaleString()})`,
            ...s.auditLog,
          ],
        }));
        return "match";
      }

      setState((s) => {
        const duplicate = s.flags.some(
          (flag) =>
            flag.kind === "dob-mismatch" &&
            flag.subjectId === "member" &&
            flag.status === "open"
        );
        if (duplicate) return { ...s, lastIdCheck: check };

        const email = makeEmail(
          s.verifiedEmail ?? member.email.trim(),
          "Your Covenant account was flagged — ID date of birth check",
          `Hi ${member.firstName || "friend"},\n\nWe checked the date of birth on the ID you submitted against the date of birth on your Covenant profile (${formatDob(
            member.dateOfBirth
          )}). They do not match.\n\nYour ID verification is on hold and your account has been flagged for manual review. If your profile date of birth is incorrect, update it and try again. If you believe this is a mistake, contact our Trust & Safety team.\n\nCovenant Trust & Safety`,
          "safety"
        );
        const flag: SafetyFlag = {
          id: `flag-dob-${Date.now()}`,
          kind: "dob-mismatch",
          subjectId: "member",
          subjectName: member.firstName || "You",
          summary: `Date of birth on the ID does not match the profile (${formatDob(
            member.dateOfBirth
          )})`,
          evidence:
            "The submitted ID date of birth differs from the profile date of birth. The ID value is not stored.",
          severity: "High",
          status: "open",
          at: Date.now(),
          emailTo: email.to,
          emailSentAt: email.at,
        };

        return {
          ...s,
          lastIdCheck: check,
          flags: [flag, ...s.flags],
          outbox: [email, ...s.outbox],
          auditLog: [
            `Date-of-birth mismatch flagged: ${member.firstName || "Member"} (${new Date().toLocaleString()})`,
            ...s.auditLog,
          ],
        };
      });

      return "mismatch";
    },
    [state]
  );

  const activatePremium = useCallback((planId: string) => {
    setState((s) => ({ ...s, premium: true, premiumPlan: planId, premiumSince: Date.now() }));
  }, []);

  const cancelPremium = useCallback(() => {
    setState((s) => ({ ...s, premium: false, premiumPlan: null, premiumSince: null }));
  }, []);

  const updatePreferences = useCallback(
    (preferences: Preferences) => {
      setState((s) => ({ ...s, preferences }));
      // Denomination importance is also a profile field, so keep the server copy in sync.
      if (state.member && state.member.denominationImportance !== preferences.denominationImportance) {
        updateMember({ ...state.member, denominationImportance: preferences.denominationImportance });
      }
    },
    [state.member, updateMember]
  );

  const updateNotifications = useCallback((notifications: NotificationSettings) => {
    setState((s) => ({ ...s, notifications }));
  }, []);

  const unlockAdmin = useCallback((code: string) => {
    const approved = code.trim().toUpperCase() === ADMIN_ACCESS_CODE;
    if (approved) {
      setState((s) => ({
        ...s,
        adminUnlocked: true,
        auditLog: ["Admin console unlocked (demo) at " + new Date().toLocaleString(), ...s.auditLog],
      }));
    }
    return approved;
  }, []);

  const resolveReport = useCallback((reportId: string, action: "Warn" | "Suspend" | "Dismiss") => {
    setState((s) => {
      const report = s.reports.find((r) => r.id === reportId);
      if (!report) return s;
      return {
        ...s,
        reports: s.reports.filter((r) => r.id !== reportId),
        auditLog: [
          `${action}: ${report.profileName} — ${report.reason} (${new Date().toLocaleString()})`,
          ...s.auditLog,
        ],
      };
    });
  }, []);

  const resolveFlag = useCallback((flagId: string, action: "Uphold" | "Clear") => {
    setState((s) => {
      const flag = s.flags.find((candidate) => candidate.id === flagId);
      if (!flag || flag.status !== "open") return s;

      if (action === "Clear") {
        return {
          ...s,
          flags: s.flags.map((candidate) =>
            candidate.id === flagId ? { ...candidate, status: "cleared" as const } : candidate
          ),
          auditLog: [
            `Safety flag cleared: ${flag.subjectName} — ${flag.summary} (${new Date().toLocaleString()})`,
            ...s.auditLog,
          ],
        };
      }

      const email =
        s.member &&
        flag.subjectId === "member" &&
        isEmailVerified(s.member.email, s.verifiedEmail)
          ? makeEmail(
              s.member.email.trim(),
              "Safety notice on your Covenant account",
              `Hi ${s.member.firstName || "friend"},\n\nA moderator reviewed a safety signal on your account: ${SAFETY_FLAG_LABELS[flag.kind]} — ${flag.summary}.\n\nThis is a notice, not an automatic suspension. Please review the community covenant and keep all conversations on Covenant. Repeated violations may lead to restrictions.\n\nCovenant Trust & Safety`,
              "safety"
            )
          : null;

      return {
        ...s,
        flags: s.flags.map((candidate) =>
          candidate.id === flagId
            ? {
                ...candidate,
                status: "upheld" as const,
                emailTo: email?.to ?? null,
                emailSentAt: email?.at ?? null,
              }
            : candidate
        ),
        outbox: email ? [email, ...s.outbox] : s.outbox,
        auditLog: [
          `Safety flag upheld: ${flag.subjectName} — ${flag.summary} (${new Date().toLocaleString()})`,
          ...s.auditLog,
        ],
      };
    });
  }, []);

  const resolveVerification = useCallback((profileId: string, decision: "approved" | "rejected") => {
    setState((s) => {
      const profile = PROFILES.find((p) => p.id === profileId);
      return {
        ...s,
        verificationDecisions: { ...s.verificationDecisions, [profileId]: decision },
        auditLog: [
          `${decision === "approved" ? "ID approved" : "ID rejected"}: ${profile?.firstName ?? profileId} (${new Date().toLocaleString()})`,
          ...s.auditLog,
        ],
      };
    });
  }, []);

  /**
   * Clears simulated activity only. The server account, profile, verification
   * tier and notification preferences are kept so the member stays signed in.
   */
  const resetDemo = useCallback(() => {
    setState((s) => ({
      ...createBaseState(),
      accountId: s.accountId,
      member: s.member,
      onboarded: s.onboarded,
      verification: s.verification,
      verifiedEmail: s.verifiedEmail,
      emailCode: s.emailCode,
      preferences: s.preferences,
      notifications: s.notifications,
    }));
  }, []);

  const value = useMemo<CovenantContextValue>(
    () => ({
      state,
      sessionReady,
      toast,
      showToast,
      registerAccount,
      signIn,
      signOut,
      deleteAccount,
      requestEmailCode,
      confirmEmailCode,
      updateMember,
      sendInterest,
      passProfile,
      undoPass,
      saveProfile,
      reportProfile,
      blockProfile,
      unblockProfile,
      startChat,
      sendMessage,
      sendCommunityMessage,
      setMemberPhoto,
      verifyPhone,
      verifyPhoto,
      submitIdCheck,
      activatePremium,
      cancelPremium,
      updatePreferences,
      updateNotifications,
      unlockAdmin,
      resolveReport,
      resolveFlag,
      resolveVerification,
      resetDemo,
    }),
    [
      state,
      sessionReady,
      toast,
      showToast,
      registerAccount,
      signIn,
      signOut,
      deleteAccount,
      requestEmailCode,
      confirmEmailCode,
      updateMember,
      sendInterest,
      passProfile,
      undoPass,
      saveProfile,
      reportProfile,
      blockProfile,
      unblockProfile,
      startChat,
      sendMessage,
      sendCommunityMessage,
      setMemberPhoto,
      verifyPhone,
      verifyPhoto,
      submitIdCheck,
      activatePremium,
      cancelPremium,
      updatePreferences,
      updateNotifications,
      unlockAdmin,
      resolveReport,
      resolveFlag,
      resolveVerification,
      resetDemo,
    ]
  );

  return (
    <CovenantContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="toast-enter pointer-events-auto max-w-md rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-canvas shadow-lg"
          >
            {toast.message}
          </div>
        )}
      </div>
    </CovenantContext.Provider>
  );
}

export function useCovenant(): CovenantContextValue {
  const ctx = useContext(CovenantContext);
  if (!ctx) throw new Error("useCovenant must be used within CovenantProvider");
  return ctx;
}
