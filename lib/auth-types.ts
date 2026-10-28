import type { MemberProfile } from "./types";

export interface SessionUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface SessionResponse {
  user: SessionUser | null;
  profile: MemberProfile | null;
}

export interface SignupResponse {
  user: SessionUser;
  profile: MemberProfile;
  demoCode: string | null;
}

export interface EmailCodeResponse {
  demoCode: string | null;
  expiresAt: number;
}

export interface ProfileResponse {
  profile: MemberProfile;
}

export interface SignupPayload {
  email: string;
  password: string;
  phone: string | null;
  profile: MemberProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}
