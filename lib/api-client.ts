import type {
  EmailCodeResponse,
  LoginPayload,
  ProfileResponse,
  SessionResponse,
  SessionUser,
  SignupPayload,
  SignupResponse,
} from "./auth-types";
import type { MemberProfile } from "./types";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json" },
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string; code?: string })
    | null;

  if (!response.ok) {
    throw new ApiError(data?.error ?? "Something went wrong. Please try again.", response.status, data?.code);
  }
  return data as T;
}

export const authApi = {
  session: () => request<SessionResponse>("/api/auth/session"),

  signup: (payload: SignupPayload) =>
    request<SignupResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: LoginPayload) =>
    request<SessionResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  requestEmailCode: () =>
    request<EmailCodeResponse>("/api/auth/email/code", { method: "POST" }),

  verifyEmailCode: (code: string) =>
    request<{ user: SessionUser }>("/api/auth/email/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  saveProfile: (profile: MemberProfile) =>
    request<ProfileResponse>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ profile }),
    }),

  deleteAccount: (password: string) =>
    request<{ ok: true }>("/api/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),
};
