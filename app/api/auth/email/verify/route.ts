import { getDb } from "@/lib/db";
import { getUserById, toSessionUser, verifyEmailCode } from "@/lib/server/accounts";
import { ApiError } from "@/lib/server/errors";
import { assertSameOrigin, errorResponse, jsonResponse, readJsonBody } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { requireSessionUser } from "@/lib/server/session";
import { parseEmailCode } from "@/lib/server/validation";

const FAILURES: Record<string, string> = {
  missing: "Request a verification code first.",
  expired: "That code has expired. Request a new one.",
  invalid: "That code is not correct.",
  locked: "Too many incorrect attempts. Request a new code.",
};

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const sessionUser = await requireSessionUser();
    if (!rateLimit(`verify-email:${sessionUser.id}`, 10, 10 * 60 * 1000)) {
      throw new ApiError(429, "Too many attempts. Wait a few minutes and try again.");
    }

    const db = getDb();
    const code = parseEmailCode(await readJsonBody(request));
    const result = await verifyEmailCode(db, sessionUser.id, code);
    if (!result.ok) {
      const status = result.reason === "locked" ? 429 : 400;
      throw new ApiError(status, FAILURES[result.reason] ?? "That code is not correct.");
    }

    const user = getUserById(db, sessionUser.id);
    if (!user) throw new ApiError(401, "Sign in to continue.", "unauthenticated");
    return jsonResponse({ user: toSessionUser(user) });
  } catch (error) {
    return errorResponse(error);
  }
}
