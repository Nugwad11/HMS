import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/server/accounts";
import { errorResponse, jsonResponse } from "@/lib/server/http";
import { readSessionUser } from "@/lib/server/session";

export async function GET() {
  try {
    const user = await readSessionUser();
    if (!user) return jsonResponse({ user: null, profile: null });
    return jsonResponse({ user, profile: getProfile(getDb(), user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
