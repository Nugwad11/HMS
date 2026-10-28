import { getDb } from "@/lib/db";
import { issueEmailCode, registerAccount } from "@/lib/server/accounts";
import { demoEmailCodesVisible } from "@/lib/server/demo";
import { ApiError } from "@/lib/server/errors";
import { assertSameOrigin, clientKey, errorResponse, jsonResponse, readJsonBody } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { startSession } from "@/lib/server/session";
import { parseSignupPayload } from "@/lib/server/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!rateLimit(`signup:${clientKey(request)}`, 8, 15 * 60 * 1000)) {
      throw new ApiError(429, "Too many sign-up attempts. Please try again later.");
    }

    const payload = parseSignupPayload(await readJsonBody(request));
    const db = getDb();
    const { user, profile } = await registerAccount(db, payload);

    await startSession(user.id);
    const code = await issueEmailCode(db, user.id);

    return jsonResponse(
      { user, profile, demoCode: demoEmailCodesVisible() ? code.code : null },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
