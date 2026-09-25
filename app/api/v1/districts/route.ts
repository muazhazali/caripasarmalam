import { getDistrictsByState } from "@/lib/db";
import { apiError, cacheHeaders, checkRateLimit, json, preflight } from "@/lib/api";

export const runtime = "nodejs";

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request) {
  const { limited, headers: rateHeaders } = await checkRateLimit(request, "api:districts", 60, 60 * 1000);
  if (limited) {
    return apiError(429, "rate_limited", "Too many requests. Please retry later.", { "Retry-After": "60" });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  if (!state) {
    return apiError(400, "missing_param", "Query parameter 'state' is required.");
  }

  try {
    const districts = await getDistrictsByState(state);
    return json(
      { data: districts, meta: { count: districts.length } },
      { headers: { ...cacheHeaders(3600, 86400), ...rateHeaders } },
    );
  } catch (e) {
    console.error("API /districts error:", e);
    return apiError(500, "internal_error", "Failed to fetch districts.");
  }
}