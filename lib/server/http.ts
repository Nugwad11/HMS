import { ApiError } from "./errors";

const MAX_BODY_BYTES = 1_500_000;

export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return jsonResponse({ error: error.message, code: error.code }, error.status);
  }
  console.error("Unhandled API error:", error instanceof Error ? error.message : "unknown error");
  return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new ApiError(413, "That request is too large.");
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new ApiError(413, "That request is too large.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "Send a valid JSON body.");
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    throw new ApiError(400, "Invalid request origin.");
  }

  if (origin !== expected) {
    throw new ApiError(403, "Cross-site request blocked.");
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}
