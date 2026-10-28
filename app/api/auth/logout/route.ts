import { assertSameOrigin, errorResponse, jsonResponse } from "@/lib/server/http";
import { endSession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await endSession();
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
