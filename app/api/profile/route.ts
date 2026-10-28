import { getDb } from "@/lib/db";
import { getProfile, saveProfileForUser } from "@/lib/server/accounts";
import { ApiError } from "@/lib/server/errors";
import { assertSameOrigin, errorResponse, jsonResponse, readJsonBody } from "@/lib/server/http";
import { requireSessionUser } from "@/lib/server/session";
import { parseProfile } from "@/lib/server/validation";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const profile = getProfile(getDb(), user.id);
    if (!profile) throw new ApiError(404, "Profile not found.", "profile-missing");
    return jsonResponse({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();
    const body = (await readJsonBody(request)) as { profile?: unknown };
    const member = parseProfile(body.profile, user.email);
    const saved = saveProfileForUser(getDb(), user.id, member);
    return jsonResponse({ profile: saved });
  } catch (error) {
    return errorResponse(error);
  }
}
