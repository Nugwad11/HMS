import { getDb } from "@/lib/db";
import { authenticateAccount, getProfile, toSessionUser } from "@/lib/server/accounts";
import { ApiError } from "@/lib/server/errors";
import { assertSameOrigin, clientKey, errorResponse, jsonResponse, readJsonBody } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { startSession } from "@/lib/server/session";
import { parseLoginPayload } from "@/lib/server/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!rateLimit(`login:${clientKey(request)}`, 10, 10 * 60 * 1000)) {
      throw new ApiError(429, "Too many sign-in attempts. Wait a few minutes and try again.");
    }

    const { email, password } = parseLoginPayload(await readJsonBody(request));
    const db = getDb();
    const user = await authenticateAccount(db, email, password);
    if (!user) {
      throw new ApiError(401, "Email or password is incorrect.", "invalid-credentials");
    }

    await startSession(user.id);
    return jsonResponse({ user: toSessionUser(user), profile: getProfile(db, user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
