import { getAllStates } from "@/lib/db";
import { apiError, cacheHeaders, checkRateLimit, json, preflight } from "@/lib/api";

export const runtime = "nodejs";

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request) {
  const { limited, headers: rateHeaders } = await checkRateLimit(request, "api:states", 60, 60 * 1000);
  if (limited) {
    return apiError(429, "rate_limited", "Too many requests. Please retry later.", { "Retry-After": "60" });
  }

  try {
    const states = await getAllStates();
    return json(
      { data: states, meta: { count: states.length } },
      { headers: { ...cacheHeaders(3600, 86400), ...rateHeaders } },
    );
  } catch (e) {
    console.error("API /states error:", e);
    return apiError(500, "internal_error", "Failed to fetch states.");
  }
}
