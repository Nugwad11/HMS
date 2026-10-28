import { getDb } from "@/lib/db";
import { deleteAccount } from "@/lib/server/accounts";
import { assertSameOrigin, errorResponse, jsonResponse, readJsonBody } from "@/lib/server/http";
import { endSession, requireSessionUser } from "@/lib/server/session";
import { parsePasswordConfirmation } from "@/lib/server/validation";

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();
    const password = parsePasswordConfirmation(await readJsonBody(request));

    await deleteAccount(getDb(), user.id, password);
    await endSession();
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
