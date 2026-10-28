import { getDb } from "@/lib/db";
import { issueEmailCode } from "@/lib/server/accounts";
import { demoEmailCodesVisible } from "@/lib/server/demo";
import { ApiError } from "@/lib/server/errors";
import { assertSameOrigin, errorResponse, jsonResponse } from "@/lib/server/http";
import { requireSessionUser } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();
    if (user.emailVerified) {
      throw new ApiError(400, "That email is already verified.", "already-verified");
    }

    const { code, expiresAt } = await issueEmailCode(getDb(), user.id);
    return jsonResponse({ demoCode: demoEmailCodesVisible() ? code : null, expiresAt });
  } catch (error) {
    return errorResponse(error);
  }
}
