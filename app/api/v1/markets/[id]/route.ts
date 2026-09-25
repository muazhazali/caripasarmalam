import { getMarketById } from "@/lib/db";
import { apiError, cacheHeaders, checkRateLimit, json, preflight } from "@/lib/api";

export const runtime = "nodejs";

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { limited, headers: rateHeaders } = await checkRateLimit(request, "api:market", 60, 60 * 1000);
  if (limited) {
    return apiError(429, "rate_limited", "Too many requests. Please retry later.", { "Retry-After": "60" });
  }

  const { id } = await params;

  try {
    const market = await getMarketById(id);
    if (!market) {
      return apiError(404, "not_found", `Market '${id}' not found.`);
    }
    return json({ data: market }, { headers: { ...cacheHeaders(60, 300), ...rateHeaders } });
  } catch (e) {
    console.error("API /markets/[id] error:", e);
    return apiError(500, "internal_error", "Failed to fetch market.");
  }
}